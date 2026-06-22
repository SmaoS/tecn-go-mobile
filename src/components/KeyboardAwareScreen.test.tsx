import { fireEvent, render } from '@testing-library/react-native'
import { Keyboard, ScrollView, Text } from 'react-native'
import { KeyboardAwareScreen } from './KeyboardAwareScreen'

describe('KeyboardAwareScreen', () => {
  it('keeps taps available, allows scrolling and dismisses the keyboard on drag', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined)
    const view = render(
      <KeyboardAwareScreen keyboardVerticalOffset={24}>
        <Text>Formulario</Text>
      </KeyboardAwareScreen>,
    )
    const scroll = view.UNSAFE_getByType(ScrollView)

    expect(view.getByText('Formulario')).toBeTruthy()
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled')
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false)
    fireEvent(scroll, 'scrollBeginDrag')
    expect(dismiss).toHaveBeenCalled()
  })
})
