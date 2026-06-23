import { fireEvent, waitFor } from '@testing-library/react-native'
import { Share } from 'react-native'
import { renderWithProviders } from '../../../test/render'
import { DataRightsCard } from './DataRightsCard'
import { complianceApi } from '../api'
import { showToast } from '../../../components/Toast'

jest.mock('../api', () => ({
  complianceApi: {
    exportMine: jest.fn(),
    requestAnonymization: jest.fn(),
  },
}))
jest.mock('../../../components/Toast', () => ({ showToast: jest.fn() }))

describe('DataRightsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
  })

  it('exports and shares the current user data', async () => {
    jest.mocked(complianceApi.exportMine).mockResolvedValue({ fullName: 'Cliente TecnGo' } as never)
    const view = renderWithProviders(<DataRightsCard />)

    fireEvent.press(view.getByText('Exportar mis datos'))

    await view.findByText('Exportar mis datos')
    expect(complianceApi.exportMine).toHaveBeenCalled()
    await expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Mis datos de TecnGo',
      message: expect.stringContaining('Cliente TecnGo'),
    }))
    expect(showToast).toHaveBeenCalledWith('Copia de datos generada')
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
})
