import { fireEvent, render } from '@testing-library/react-native'
import { Keyboard, ScrollView, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardAwareScreen } from './KeyboardAwareScreen'

describe('KeyboardAwareScreen', () => {
  it('keeps taps available, allows scrolling and dismisses the keyboard on drag', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined)
    const view = render(
      <SafeAreaProvider initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 24, right: 0, bottom: 34, left: 0 },
      }}>
        <KeyboardAwareScreen keyboardVerticalOffset={24}>
          <Text>Formulario</Text>
        </KeyboardAwareScreen>
      </SafeAreaProvider>,
    )
    const scroll = view.UNSAFE_getByType(ScrollView)

    expect(view.getByText('Formulario')).toBeTruthy()
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled')
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false)
    fireEvent(scroll, 'scrollBeginDrag')
    expect(dismiss).toHaveBeenCalled()
  })
})
