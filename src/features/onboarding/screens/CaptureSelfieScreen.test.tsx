import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { CaptureSelfieScreen } from './CaptureSelfieScreen'

describe('CaptureSelfieScreen', () => {
  it('captura selfie y la devuelve al wizard para revisión manual', async () => {
    const navigation = { navigate: jest.fn() }
    const view = render(<CaptureSelfieScreen
      navigation={navigation as never}
      route={{ key: 'CaptureSelfie', name: 'CaptureSelfie' } as never}
    />)

    fireEvent.press(view.getByText('Tomar foto para revisión'))
    await waitFor(() => expect(view.getByText('Foto capturada correctamente.')).toBeTruthy())
    fireEvent.press(view.getByText('Usar foto'))

    expect(navigation.navigate).toHaveBeenCalledWith('OnboardingRequired', {
      selfieUri: 'file://camera-capture.jpg',
      faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
    })
  })
})
