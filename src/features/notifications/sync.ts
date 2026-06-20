import type { QueryClient } from '@tanstack/react-query'
import type { UserNotification } from '../../types'
import { requestKeys } from '../service-requests/hooks'
import { notificationKeys } from './hooks'

type PushData = {
  notificationType?: string
  type?: string
  requestId?: string
}

export async function syncNotificationData(client: QueryClient, data: PushData) {
  const type = (data.notificationType ?? data.type) as UserNotification['type'] | undefined
  const requestId = data.requestId
  const invalidations: Promise<unknown>[] = [
    client.invalidateQueries({ queryKey: notificationKeys.all }),
    client.invalidateQueries({ queryKey: notificationKeys.unread }),
  ]

  if (requestId) {
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.detail(requestId) }))
  }
  if (type === 'NEW_CHAT_MESSAGE' && requestId) {
    invalidations.push(client.invalidateQueries({ queryKey: ['chat', requestId] }))
  }
  if (type === 'NEW_QUOTE' && requestId) {
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.quotes(requestId) }))
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.client }))
  }
  if (type === 'NEW_REQUEST') {
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.availableRoot }))
  }
  if (type === 'QUOTE_ACCEPTED' || type === 'QUOTE_REJECTED' || type === 'REQUEST_ACCEPTED') {
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.availableRoot }))
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.assigned }))
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.client }))
  }
  if (type === 'TECHNICIAN_ON_THE_WAY' || type === 'TECHNICIAN_ARRIVED'
      || type === 'SERVICE_STARTED' || type === 'SERVICE_COMPLETED'
      || type === 'SERVICE_STATUS_CHANGED') {
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.client }))
    invalidations.push(client.invalidateQueries({ queryKey: requestKeys.assigned }))
  }
  if (type === 'PAYMENT_PROOF_UPLOADED' || type === 'PAYMENT_PROOF_VERIFIED'
      || type === 'SERVICE_EVIDENCE_UPLOADED') {
    invalidations.push(client.invalidateQueries({ queryKey: ['payment-proofs'] }))
    invalidations.push(client.invalidateQueries({ queryKey: ['service-evidence'] }))
  }
  if (type === 'NEW_RATING') {
    invalidations.push(client.invalidateQueries({ queryKey: ['ratings'] }))
  }

  await Promise.all(invalidations)
}
