import { fireEvent } from '@testing-library/react-native'
import { renderWithProviders } from '../../../test/render'
import { notificationFixture } from '../../../test/fixtures'
import { NotificationsScreen } from './NotificationsScreen'
import { useDeleteNotification, useMarkNotificationRead, useNotifications } from '../hooks'
import { openNotification } from '../../../navigation/notificationNavigation'

jest.mock('../hooks', () => ({
  useNotifications: jest.fn(),
  useMarkNotificationRead: jest.fn(),
  useDeleteNotification: jest.fn(),
}))
jest.mock('../../../navigation/notificationNavigation', () => ({
  openNotification: jest.fn(),
}))

describe('NotificationsScreen', () => {
  const read = jest.fn()
  const remove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useNotifications).mockReturnValue({
      data: [notificationFixture()],
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useMarkNotificationRead).mockReturnValue({ mutate: read } as never)
    jest.mocked(useDeleteNotification).mockReturnValue({ mutate: remove } as never)
  })

  it('marks a notification read and opens its target after settling', () => {
    read.mockImplementation((item, options) => options.onSettled())
    const view = renderWithProviders(
      <NotificationsScreen navigation={{} as never} route={{} as never} />,
    )

    expect(view.getByText(/Nueva cotización recibida.*Nueva/)).toBeTruthy()
    fireEvent.press(view.getByText(/Nueva cotización recibida.*Nueva/))

    expect(read).toHaveBeenCalledWith(expect.objectContaining({ id: 'notification-1' }), expect.any(Object))
    expect(openNotification).toHaveBeenCalledWith(expect.anything(), 'CLIENT', expect.objectContaining({
      requestId: 'request-1',
    }))
  })

  it('deletes a notification from its dedicated action', () => {
    const view = renderWithProviders(
      <NotificationsScreen navigation={{} as never} route={{} as never} />,
    )

    fireEvent.press(view.getByLabelText('Eliminar notificación'))
    expect(remove).toHaveBeenCalledWith('notification-1')
  })
})
