import { fireEvent } from '@testing-library/react-native'
import { quoteFixture, serviceRequestFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/render'
import { RequestDetailScreen } from './RequestDetailScreen'
import {
  useRequestAction,
  useRequestDetail,
  useRequestQuotes,
  useTechnicianLocation,
} from '../hooks'
import { useRatingStatus } from '../../ratings/hooks'

jest.mock('../hooks', () => ({
  useRequestAction: jest.fn(),
  useRequestDetail: jest.fn(),
  useRequestQuotes: jest.fn(),
  useTechnicianLocation: jest.fn(),
}))
jest.mock('../../ratings/hooks', () => ({ useRatingStatus: jest.fn() }))
jest.mock('../../../components/PrivateImage', () => ({
  PrivateImage: ({ url }: { url: string }) => {
    const { Text } = require('react-native')
    return <Text>{url}</Text>
  },
}))

describe('RequestDetailScreen', () => {
  const mutate = jest.fn()
  const navigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useRequestQuotes).mockReturnValue({
      data: [],
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useTechnicianLocation).mockReturnValue({ data: null } as never)
    jest.mocked(useRequestAction).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useRatingStatus).mockReturnValue({
      data: { rated: false },
      isPending: false,
      error: null,
    } as never)
  })

  function renderRequest(overrides = {}) {
    const request = serviceRequestFixture(overrides)
    jest.mocked(useRequestDetail).mockReturnValue({
      data: request,
      isPending: false,
      error: null,
    } as never)
    return renderWithProviders(
      <RequestDetailScreen
        route={{ params: { request } } as never}
        navigation={{ navigate } as never}
      />,
    )
  }

  it('shows pending quotes and lets the client accept or reject one', () => {
    jest.mocked(useRequestQuotes).mockReturnValue({
      data: [quoteFixture({ technicianProfilePhotoUrl: '/tech-avatar.jpg' })],
      isPending: false,
      error: null,
    } as never)
    const view = renderRequest({ status: 'QUOTE_PENDING' })

    expect(view.getByText('Técnico TecnGo')).toBeTruthy()
    expect(view.getByText('✓ Certificado')).toBeTruthy()
    expect(view.getByText('$120.000 COP')).toBeTruthy()
    expect(view.getByText('/tech-avatar.jpg')).toBeTruthy()

    fireEvent.press(view.getByText('Aceptar esta cotización'))
    expect(mutate).toHaveBeenCalledWith({ kind: 'confirmQuote', quoteId: 'quote-1' })
    fireEvent.press(view.getByText('Rechazar cotización'))
    expect(mutate).toHaveBeenCalledWith({ kind: 'rejectQuote', quoteId: 'quote-1' })
  })

  it('offers cancellation, chat and service support while active', () => {
    const view = renderRequest({
      status: 'IN_PROGRESS',
      technicianId: 'user-technician-1',
      technicianName: 'Técnico asignado',
    })

    fireEvent.press(view.getByText('Cancelar solicitud'))
    expect(mutate).toHaveBeenCalledWith({ kind: 'status', status: 'CANCELLED' })
    fireEvent.press(view.getByText('Abrir chat'))
    expect(navigate).toHaveBeenCalledWith('Chat', { requestId: 'request-1' })
    fireEvent.press(view.getByText('Evidencias, pagos y reportes'))
    expect(navigate).toHaveBeenCalledWith('ServiceSupport', { requestId: 'request-1' })
  })

  it('shows rating only after payment and while it remains pending', () => {
    const view = renderRequest({ status: 'PAID', technicianId: 'user-technician-1' })

    expect(view.queryByText('Cancelar solicitud')).toBeNull()
    fireEvent.press(view.getByText('Calificar servicio'))
    expect(navigate).toHaveBeenCalledWith('Rating', { requestId: 'request-1' })
  })

  it('explains that technician confirmation is required after completion', () => {
    const view = renderRequest({ status: 'COMPLETED', technicianId: 'user-technician-1' })

    expect(view.getByText('Pendiente de cierre')).toBeTruthy()
    expect(view.getByText(/El técnico debe confirmar/)).toBeTruthy()
    expect(view.queryByText('Calificar servicio')).toBeNull()
  })
})
