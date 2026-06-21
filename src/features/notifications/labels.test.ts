import type { UserNotification } from '../../types'
import { notificationTitle } from './labels'

const notification = (type: UserNotification['type'], title = 'Título original'): UserNotification => ({
  id: 'notification-1',
  title,
  message: 'Mensaje',
  type,
  read: false,
  createdAt: '2026-06-21T12:00:00Z',
})

describe('notificationTitle', () => {
  it('traduce eventos conocidos', () => {
    expect(notificationTitle(notification('NEW_QUOTE'))).toBe('Nueva cotización recibida')
  })

  it('mantiene el título original si no existe traducción', () => {
    expect(notificationTitle(notification('CONTENT_MODERATION_ALERT'))).toBe('Título original')
  })
})
