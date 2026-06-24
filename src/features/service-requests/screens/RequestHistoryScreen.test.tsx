import { fireEvent } from '@testing-library/react-native'
import { renderWithProviders } from '../../../test/render'
import { serviceRequestFixture } from '../../../test/fixtures'
import { ClientRequestHistoryScreen } from './RequestHistoryScreen'
import { useClientRequestHistory } from '../hooks'

jest.mock('../hooks', () => ({
  useClientRequestHistory: jest.fn(),
  useAssignedRequestHistory: jest.fn(),
}))

describe('ClientRequestHistoryScreen', () => {
  it('muestra varias solicitudes históricas en tarjetas compactas', () => {
    const first = serviceRequestFixture({
      id: 'request-paid',
      categoryName: 'Electricista',
      status: 'PAID',
      finalPrice: 60000,
    })
    const second = serviceRequestFixture({
      id: 'request-cancelled',
      categoryName: 'Plomero',
      status: 'CANCELLED',
      finalPrice: undefined,
    })
    const navigate = jest.fn()
    jest.mocked(useClientRequestHistory).mockReturnValue({
      data: [first, second],
      isPending: false,
      error: null,
    } as never)

    const view = renderWithProviders(
      <ClientRequestHistoryScreen navigation={{ navigate } as never} route={{} as never} />,
    )

    expect(view.getByText('Electricista')).toBeTruthy()
    expect(view.getByText('Plomero')).toBeTruthy()

    fireEvent.press(view.getByText('Plomero'))
    expect(navigate).toHaveBeenCalledWith('RequestDetail', { request: second })
  })
})
