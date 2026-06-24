import { fireEvent, render } from '@testing-library/react-native'
import { serviceRequestFixture } from '../../../test/fixtures'
import { useLiveCurrentLocation } from '../../location/hooks'
import { useSendQuote } from '../hooks'
import { AvailableRequestDetailModal } from './AvailableRequestDetailModal'

jest.mock('../hooks', () => ({ useSendQuote: jest.fn() }))
jest.mock('../../location/hooks', () => ({ useLiveCurrentLocation: jest.fn() }))
jest.mock('../../../components/PrivateImage', () => ({ PrivateImage: () => null }))
jest.mock('../../../components/RoutePreviewMap', () => ({ RoutePreviewMap: () => null }))
jest.mock('../../../components/Toast', () => ({ showToast: jest.fn() }))

describe('AvailableRequestDetailModal', () => {
  beforeEach(() => {
    jest.mocked(useLiveCurrentLocation).mockReturnValue({
      coordinates: { latitude: 4.14, longitude: -73.63 },
      error: '',
      isLocating: false,
    })
  })

  it('formatea y envía la cotización digitada', () => {
    const mutate = jest.fn()
    jest.mocked(useSendQuote).mockReturnValue({
      mutate,
      reset: jest.fn(),
      isPending: false,
      error: null,
    } as never)
    const request = serviceRequestFixture()
    const view = render(<AvailableRequestDetailModal
      request={request}
      onClose={jest.fn()}
    />)

    fireEvent.changeText(view.getByPlaceholderText('Valor de la cotización'), '120000')
    expect(view.getByDisplayValue('120.000')).toBeTruthy()
    fireEvent.changeText(view.getByPlaceholderText('Valor de la cotización'), '')
    expect(view.getByPlaceholderText('Valor de la cotización').props.value).toBe('')
    fireEvent.changeText(view.getByPlaceholderText('Valor de la cotización'), '120000')
    fireEvent.changeText(view.getByPlaceholderText('Comentario para el cliente'), 'Incluye materiales')
    fireEvent.press(view.getByText('Enviar cotización'))

    expect(mutate).toHaveBeenCalledWith({
      id: request.id,
      price: 120000,
      description: 'Incluye materiales',
    }, expect.any(Object))
  })

  it('limpia valor y comentario al cambiar de solicitud', () => {
    jest.mocked(useSendQuote).mockReturnValue({
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      error: null,
    } as never)
    const view = render(<AvailableRequestDetailModal
      request={serviceRequestFixture({ id: 'request-1' })}
      onClose={jest.fn()}
    />)
    fireEvent.changeText(view.getByPlaceholderText('Valor de la cotización'), '120000')
    fireEvent.changeText(view.getByPlaceholderText('Comentario para el cliente'), 'Comentario')

    view.rerender(<AvailableRequestDetailModal
      request={serviceRequestFixture({ id: 'request-2' })}
      onClose={jest.fn()}
    />)

    expect(view.getByPlaceholderText('Valor de la cotización').props.value).toBe('')
    expect(view.getByPlaceholderText('Comentario para el cliente').props.value).toBe('')
  })

  it('oculta acciones de cotización cuando ya existe una cotización pendiente', () => {
    jest.mocked(useSendQuote).mockReturnValue({
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      error: null,
    } as never)
    const view = render(<AvailableRequestDetailModal
      request={serviceRequestFixture({ myPendingQuote: true })}
      onClose={jest.fn()}
    />)

    expect(view.queryByText(/Aceptar oferta por/)).toBeNull()
    expect(view.queryByText('Enviar cotización')).toBeNull()
    expect(view.queryByPlaceholderText('Valor de la cotización')).toBeNull()
    expect(view.getByText(/Ya enviaste una cotización/)).toBeTruthy()
  })
})
