import { fireEvent, render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
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
    const view = render(<SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 24, right: 0, bottom: 34, left: 0 },
    }}>
      <RatingScreen
        route={{
          key: 'Rating',
          name: 'Rating',
          params: { requestId: 'request-1' },
        } as never}
        navigation={{ popToTop: jest.fn() } as never}
      />
    </SafeAreaProvider>)

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
