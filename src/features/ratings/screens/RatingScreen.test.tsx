import { fireEvent, render } from '@testing-library/react-native'
import { useSubmitRating } from '../hooks'
import { RatingScreen } from './RatingScreen'

jest.mock('../hooks', () => ({ useSubmitRating: jest.fn() }))

describe('RatingScreen', () => {
  it('envía puntuación y comentario para la solicitud', () => {
    const mutate = jest.fn()
    jest.mocked(useSubmitRating).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as never)
    const view = render(<RatingScreen
      route={{
        key: 'Rating',
        name: 'Rating',
        params: { requestId: 'request-1' },
      } as never}
      navigation={{ popToTop: jest.fn() } as never}
    />)

    fireEvent.press(view.getAllByText('★')[3])
    fireEvent.changeText(
      view.getByPlaceholderText('Cuéntanos cómo fue la experiencia'),
      'Buen servicio',
    )
    fireEvent.press(view.getByText('Enviar calificación'))

    expect(mutate).toHaveBeenCalledWith({
      requestId: 'request-1',
      score: 4,
      comment: 'Buen servicio',
    })
  })
})
