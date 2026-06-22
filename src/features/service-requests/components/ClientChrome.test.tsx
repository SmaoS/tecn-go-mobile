import { fireEvent, render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ClientFooter } from './ClientFooter'
import { ClientHeader } from './ClientHeader'
import { ClientMenu } from './ClientMenu'
import { userProfileFixture } from '../../../test/fixtures'

jest.mock('../../../components/PrivateImage', () => ({
  PrivateImage: ({ url }: { url: string }) => {
    const { Text } = require('react-native')
    return <Text>{url}</Text>
  },
}))

describe('client navigation components', () => {
  it('opens menu and notifications and caps the unread badge', () => {
    const onMenu = jest.fn()
    const onNotifications = jest.fn()
    const view = render(
      <ClientHeader unread={12} onMenu={onMenu} onNotifications={onNotifications} />,
    )

    fireEvent.press(view.getByLabelText('Abrir menú'))
    fireEvent.press(view.getByLabelText('Notificaciones'))
    expect(onMenu).toHaveBeenCalled()
    expect(onNotifications).toHaveBeenCalled()
    expect(view.getByText('9+')).toBeTruthy()
  })

  it('changes the active footer tab', () => {
    const onSelect = jest.fn()
    const view = render(
      <SafeAreaProvider initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}>
        <ClientFooter active="request" onSelect={onSelect} />
      </SafeAreaProvider>,
    )

    fireEvent.press(view.getByText('Mis solicitudes'))
    expect(onSelect).toHaveBeenCalledWith('requests')
  })

  it('navigates from the drawer, switches mode and logs out', () => {
    const onClose = jest.fn()
    const onNavigate = jest.fn()
    const onSwitchMode = jest.fn()
    const onLogout = jest.fn()
    const view = render(
      <ClientMenu
        visible
        profile={userProfileFixture({ profilePhotoUrl: '/avatar-client.jpg' })}
        onClose={onClose}
        onNavigate={onNavigate}
        onSwitchMode={onSwitchMode}
        onLogout={onLogout}
      />,
    )

    expect(view.getByText('/avatar-client.jpg')).toBeTruthy()
    fireEvent.press(view.getByText('Pagos'))
    expect(onClose).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('ClientPayments')

    fireEvent.press(view.getByText('Modo técnico'))
    expect(onSwitchMode).toHaveBeenCalled()

    fireEvent.press(view.getByText('Cerrar sesión'))
    expect(onLogout).toHaveBeenCalled()
  })
})
