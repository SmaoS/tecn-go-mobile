import { fireEvent, render } from '@testing-library/react-native'
import { ActivityIndicator, Text } from 'react-native'
import { Button, Card, Field, LoadingOverlay, Screen, colors } from './UI'

describe('shared UI components', () => {
  it('renders fields with readable defaults and forwards input changes', () => {
    const onChangeText = jest.fn()
    const view = render(<Field placeholder="Correo" onChangeText={onChangeText} />)

    fireEvent.changeText(view.getByPlaceholderText('Correo'), 'cliente@tecngo.com')

    expect(onChangeText).toHaveBeenCalledWith('cliente@tecngo.com')
    expect(view.getByPlaceholderText('Correo').props.placeholderTextColor).toBe(colors.muted)
    expect(view.getByPlaceholderText('Correo').props.cursorColor).toBe(colors.brand)
  })

  it('disables actions while disabled or loading', () => {
    const onPress = jest.fn()
    const disabled = render(<Button title="Guardar" disabled onPress={onPress} />)
    fireEvent.press(disabled.getByText('Guardar'))
    expect(onPress).not.toHaveBeenCalled()

    const loading = render(<Button title="Guardar" loading onPress={onPress} />)
    expect(loading.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    expect(loading.queryByText('Guardar')).toBeNull()
  })

  it('renders screen, card and loading overlay content', () => {
    const view = render(
      <Screen>
        <Card><Text>Contenido</Text></Card>
        <LoadingOverlay visible text="Subiendo archivo..." />
      </Screen>,
    )

    expect(view.getByText('Contenido')).toBeTruthy()
    expect(view.getByText('Subiendo archivo...')).toBeTruthy()
  })
})
