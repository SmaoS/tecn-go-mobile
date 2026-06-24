import { fireEvent } from '@testing-library/react-native'
import { ServiceSupportScreen } from './ServiceSupportScreen'
import { useServiceSupport } from '../hooks'
import { renderWithProviders } from '../../../test/render'
import { sessionFixture } from '../../../test/fixtures'

jest.mock('../hooks', () => ({ useServiceSupport: jest.fn() }))

describe('ServiceSupportScreen', () => {
  const mutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useServiceSupport).mockReturnValue({
      evidences: {
        data: [{
          id: 'evidence-1',
          description: '',
          evidenceType: 'BEFORE_SERVICE',
          uploadedByName: 'Técnico TecnGo',
          contentAssetId: 'asset-1',
        }],
      },
      proofs: {
        data: [{
          id: 'proof-1',
          amount: 120000,
          status: 'PENDING',
          reviewComment: null,
        }],
      },
      action: { mutate, isPending: false, error: null },
    } as never)
  })

  function renderScreen(role: 'CLIENT' | 'TECHNICIAN' = 'TECHNICIAN') {
    return renderWithProviders(
      <ServiceSupportScreen
        route={{ params: { requestId: 'request-1' } } as never}
        navigation={{} as never}
      />,
      { session: sessionFixture({ role, activeMode: role, roles: [role] }) },
    )
  }

  it('cycles evidence type and uploads the entered description', () => {
    const view = renderScreen()

    fireEvent.press(view.getByText('Cambiar tipo de evidencia'))
    expect(view.getByText('Tipo: Durante el servicio')).toBeTruthy()
    fireEvent.changeText(view.getByPlaceholderText('Descripción'), 'Trabajo iniciado')
    fireEvent.press(view.getByText('Elegir y subir evidencia'))

    expect(mutate).toHaveBeenCalledWith({
      kind: 'evidence',
      evidenceType: 'DURING_SERVICE',
      description: 'Trabajo iniciado',
    })
  })

  it('uploads payment proof and sends content and service reports', () => {
    const view = renderScreen()

    fireEvent.changeText(view.getByPlaceholderText('Monto'), '150000')
    fireEvent.changeText(view.getByPlaceholderText('TRANSFER'), 'NEQUI')
    fireEvent.press(view.getByText('Elegir y subir comprobante'))
    expect(mutate).toHaveBeenCalledWith({
      kind: 'proof',
      amount: 150000,
      paymentMethod: 'NEQUI',
    })

    fireEvent.press(view.getByText('Reportar contenido o derechos de autor'))
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'contentReport',
      contentAssetId: 'asset-1',
    }))

    fireEvent.changeText(view.getByPlaceholderText('Describe lo ocurrido'), 'Cobro no autorizado')
    fireEvent.press(view.getByText('Enviar denuncia'))
    expect(mutate).toHaveBeenCalledWith({
      kind: 'report',
      description: 'Cobro no autorizado',
    })
  })

  it('oculta comprobantes de pago para clientes y mantiene evidencias/denuncias', () => {
    const view = renderScreen('CLIENT')

    expect(view.queryByText('Comprobante de pago')).toBeNull()
    expect(view.getByText('Evidencias')).toBeTruthy()
    fireEvent.changeText(view.getByPlaceholderText('Describe lo ocurrido'), 'No reconozco el cobro')
    fireEvent.press(view.getByText('Enviar denuncia'))

    expect(mutate).toHaveBeenCalledWith({
      kind: 'report',
      description: 'No reconozco el cobro',
    })
  })
})
