import { render, userEvent } from '@testing-library/react-native'
import { Button } from './UI'
import { SecureField } from './SecureField'

describe('controles compartidos', () => {
  it('permite mostrar y volver a ocultar una contraseña', async () => {
    const user = userEvent.setup()
    const view = await render(<SecureField accessibilityLabel="Contraseña" value="Secreta123!" />)
    const input = view.getByLabelText('Contraseña')

    expect(input.props.secureTextEntry).toBe(true)
    await user.press(view.getByLabelText('Mostrar contraseña'))
    expect(view.getByLabelText('Contraseña').props.secureTextEntry).toBe(false)
    await user.press(view.getByLabelText('Ocultar contraseña'))
    expect(view.getByLabelText('Contraseña').props.secureTextEntry).toBe(true)
  })

  it('no ejecuta botones deshabilitados', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    const view = await render(<Button title="Continuar" onPress={onPress} disabled />)

    await user.press(view.getByText('Continuar'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
