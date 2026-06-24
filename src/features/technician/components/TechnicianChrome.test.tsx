import { fireEvent, render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TechnicianAvailabilitySwitch } from './TechnicianAvailabilitySwitch'
import { TechnicianFooter } from './TechnicianFooter'
import { TechnicianHeader } from './TechnicianHeader'
import { TechnicianMenu } from './TechnicianMenu'
import { technicianProfileFixture } from '../../../test/fixtures'

jest.mock('../../../components/PrivateImage', () => ({
  PrivateImage: ({ url }: { url: string }) => {
    const { Text } = require('react-native')
    return <Text>{url}</Text>
  },
}))

describe('technician navigation components', () => {
  it('updates availability and exposes menu and notification actions', () => {
    const onAvailabilityChange = jest.fn()
    const onMenu = jest.fn()
    const onNotifications = jest.fn()
    const view = render(
      <TechnicianHeader
        available
        unread={3}
        onAvailabilityChange={onAvailabilityChange}
        onMenu={onMenu}
        onNotifications={onNotifications}
      />,
    )

    fireEvent.press(view.getByText('Ocupado'))
    fireEvent.press(view.getByLabelText('Abrir menú'))
    fireEvent.press(view.getByLabelText('Notificaciones'))
    expect(onAvailabilityChange).toHaveBeenCalledWith(false)
    expect(onMenu).toHaveBeenCalled()
    expect(onNotifications).toHaveBeenCalled()
    expect(view.getByText('3')).toBeTruthy()
  })

  it('disables availability actions while updating', () => {
    const onChange = jest.fn()
    const view = render(
      <TechnicianAvailabilitySwitch available loading onChange={onChange} />,
    )

    fireEvent.press(view.getByText('Ocupado'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('changes footer tabs and drawer routes', () => {
    const onSelect = jest.fn()
    const footer = render(
      <SafeAreaProvider initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}>
        <TechnicianFooter active="available" onSelect={onSelect} />
      </SafeAreaProvider>,
    )
    fireEvent.press(footer.getByText('Cartera'))
    expect(onSelect).toHaveBeenCalledWith('earnings')

    const onClose = jest.fn()
    const onNavigate = jest.fn()
    const onSwitchMode = jest.fn()
    const onLogout = jest.fn()
    const menu = render(
      <TechnicianMenu
        visible
        profile={technicianProfileFixture({ profilePhotoUrl: '/avatar-tech.jpg' })}
        onClose={onClose}
        onNavigate={onNavigate}
        onSwitchMode={onSwitchMode}
        onLogout={onLogout}
      />,
    )

    fireEvent.press(menu.getByText('Servicios Asignados'))
    expect(onNavigate).toHaveBeenCalledWith('TechnicianHome')
    fireEvent.press(menu.getByText('Productividad'))
    expect(onNavigate).toHaveBeenCalledWith('TechnicianProductivity')
    fireEvent.press(menu.getByText('PQR'))
    expect(onNavigate).toHaveBeenCalledWith('Pqr')
    fireEvent.press(menu.getByText('Modo cliente'))
    expect(onSwitchMode).toHaveBeenCalled()
    fireEvent.press(menu.getByText('Cerrar sesión'))
    expect(onLogout).toHaveBeenCalled()
  })
})
