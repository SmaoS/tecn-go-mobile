import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { CaptureIdentityDocumentScreen } from './CaptureIdentityDocumentScreen'

describe('CaptureIdentityDocumentScreen', () => {
  it('captura frente y reverso de cédula antes de volver al wizard', async () => {
    const navigation = { navigate: jest.fn() }
    const view = render(<CaptureIdentityDocumentScreen
      navigation={navigation as never}
      route={{
        key: 'CaptureIdentityDocument',
        name: 'CaptureIdentityDocument',
        params: { documentType: 'CC' },
      } as never}
    />)

    fireEvent.press(view.getByText('Tomar foto para revisión'))
    await waitFor(() => expect(
      view.getByText('Usar frente y capturar reverso'),
    ).toBeTruthy())
    fireEvent.press(view.getByText('Usar frente y capturar reverso'))
    fireEvent.press(view.getByText('Tomar foto para revisión'))
    await waitFor(() => expect(view.getByText('Usar foto')).toBeTruthy())
    fireEvent.press(view.getByText('Usar foto'))

    expect(navigation.navigate).toHaveBeenCalledWith('OnboardingRequired', {
      documentFrontUri: 'file://camera-capture.jpg',
      documentBackUri: 'file://camera-capture.jpg',
      documentSingleUri: undefined,
      identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED',
    })
  })
})
