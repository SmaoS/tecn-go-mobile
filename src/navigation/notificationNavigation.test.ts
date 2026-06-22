import type { NavigationContainerRefWithCurrent } from '@react-navigation/native'
import type { RootStackParamList } from '../types'
import { openNotification } from './notificationNavigation'

function navigation(ready = true) {
  return {
    isReady: jest.fn(() => ready),
    navigate: jest.fn(),
  } as unknown as NavigationContainerRefWithCurrent<RootStackParamList>
}

describe('openNotification', () => {
  it('no navega antes de que el contenedor esté listo', () => {
    const ref = navigation(false)

    openNotification(ref, 'CLIENT', { type: 'NEW_QUOTE', requestId: 'request-1' })

    expect(ref.navigate).not.toHaveBeenCalled()
  })

  it.each([
    ['CLIENT', { type: 'LEGAL_ACCEPTANCE_REQUIRED' }, 'Legal', undefined],
    ['TECHNICIAN', { type: 'NEW_REQUEST' }, 'AvailableRequests', undefined],
    ['CLIENT', { type: 'NEW_CHAT_MESSAGE', route: 'Chat', requestId: 'request-1' },
      'Chat', { requestId: 'request-1' }],
    ['CLIENT', { type: 'SERVICE_EVIDENCE_UPLOADED', route: 'ServiceSupport', requestId: 'request-1' },
      'ServiceSupport', { requestId: 'request-1' }],
    ['CLIENT', { type: 'NEW_QUOTE', requestId: 'request-1' },
      'NotificationRequest', { requestId: 'request-1' }],
    ['CLIENT', { type: 'SERVICE_STATUS_CHANGED' }, 'Home', undefined],
    ['TECHNICIAN', { type: 'SERVICE_STATUS_CHANGED' }, 'TechnicianHome', undefined],
  ] as const)('dirige %s hacia %s', (role, notification, route, params) => {
    const ref = navigation()

    openNotification(ref, role, notification)

    if (params) expect(ref.navigate).toHaveBeenCalledWith(route, params)
    else expect(ref.navigate).toHaveBeenCalledWith(route)
  })
})
