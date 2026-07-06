import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderWithProviders } from '../../../test/render'
import { DataRightsCard } from './DataRightsCard'
import { complianceApi } from '../api'
import { showToast } from '../../../components/Toast'

jest.mock('../api', () => ({
  complianceApi: {
    requestExport: jest.fn(),
    exportRequests: jest.fn(),
    requestAnonymization: jest.fn(),
    profileSelfieChangeRequests: jest.fn(),
  },
}))
jest.mock('../../../components/Toast', () => ({ showToast: jest.fn() }))

describe('DataRightsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(complianceApi.exportRequests).mockResolvedValue([])
    jest.mocked(complianceApi.profileSelfieChangeRequests).mockResolvedValue([])
  })

  it('requests a reviewed data export', async () => {
    jest.mocked(complianceApi.requestExport).mockResolvedValue({ status: 'PENDING' } as never)
    const view = renderWithProviders(<DataRightsCard />)

    fireEvent.press(view.getByText('Solicitar exportación de mis datos'))

    await waitFor(() => expect(complianceApi.requestExport).toHaveBeenCalled())
    expect(showToast).toHaveBeenCalledWith('Solicitud creada. Te enviaremos el archivo al correo')
  })

  it('requires confirmation before requesting anonymization', async () => {
    jest.mocked(complianceApi.requestAnonymization).mockResolvedValue({} as never)
    const view = renderWithProviders(<DataRightsCard />)

    fireEvent.press(view.getByText('Solicitar anonimización'))

    expect(view.getByText('Anonimizar cuenta')).toBeTruthy()
    expect(view.getByText(/administrador/)).toBeTruthy()
    fireEvent.press(view.getByText('Enviar solicitud'))
    await waitFor(() => expect(complianceApi.requestAnonymization).toHaveBeenCalled())
  })

  it('opens selfie change capture from PQR action', async () => {
    const onCaptureSelfie = jest.fn()
    const view = renderWithProviders(<DataRightsCard onCaptureSelfie={onCaptureSelfie} />)

    fireEvent.press(view.getByText('Solicitar cambio de selfie'))

    expect(onCaptureSelfie).toHaveBeenCalled()
  })
})
