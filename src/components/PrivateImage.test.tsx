import { waitFor } from '@testing-library/react-native'
import { Image } from 'react-native'
import { renderWithProviders } from '../test/render'
import { sessionFixture } from '../test/fixtures'
import { PrivateImage } from './PrivateImage'

const mockDownloadFileAsync = jest.fn()
let mockFileExists = false

jest.mock('expo-file-system', () => ({
  Paths: { cache: '/cache' },
  File: class {
    exists = mockFileExists
    uri = 'file:///cache/private.jpg'
    static downloadFileAsync(...args: unknown[]) {
      return mockDownloadFileAsync(...args)
    }
  },
}))

describe('PrivateImage', () => {
  beforeEach(() => {
    mockFileExists = false
    mockDownloadFileAsync.mockReset()
  })

  it('renders public URLs without downloading them', async () => {
    const view = renderWithProviders(
      <PrivateImage url="https://cdn.tecngo.com/avatar.jpg" accessibilityLabel="Avatar" />,
    )

    await waitFor(() => expect(view.getByLabelText('Avatar')).toBeTruthy())
    expect(view.UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://cdn.tecngo.com/avatar.jpg',
    })
    expect(mockDownloadFileAsync).not.toHaveBeenCalled()
  })

  it('does not request private files without a session token', () => {
    const view = renderWithProviders(
      <PrivateImage url="/v1/files/private-image" accessibilityLabel="Documento" />,
      { session: null },
    )

    expect(view.queryByLabelText('Documento')).toBeNull()
    expect(mockDownloadFileAsync).not.toHaveBeenCalled()
  })

  it('downloads private files with the bearer token', async () => {
    mockDownloadFileAsync.mockResolvedValue({ uri: 'file:///cache/downloaded.jpg' })
    const view = renderWithProviders(
      <PrivateImage url="/v1/files/private-image" accessibilityLabel="Documento" />,
      { session: sessionFixture({ token: 'private-token' }) },
    )

    await waitFor(() => expect(mockDownloadFileAsync).toHaveBeenCalled())
    await waitFor(() => expect(view.getByLabelText('Documento')).toBeTruthy())
    expect(mockDownloadFileAsync).toHaveBeenCalledWith(
      expect.stringContaining('/v1/files/private-image'),
      expect.anything(),
      expect.objectContaining({
        headers: { Authorization: 'Bearer private-token' },
        idempotent: true,
      }),
    )
  })
})
