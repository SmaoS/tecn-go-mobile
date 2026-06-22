import type { QueryClient } from '@tanstack/react-query'
import { requestKeys } from '../service-requests/hooks'
import { notificationKeys } from './hooks'
import { syncNotificationData } from './sync'

function client() {
  return {
    invalidateQueries: jest.fn(async () => undefined),
  } as unknown as QueryClient
}

function invalidated(queryClient: QueryClient) {
  return jest.mocked(queryClient.invalidateQueries).mock.calls
    .map(([filters]) => filters?.queryKey)
}

describe('syncNotificationData', () => {
  it('siempre actualiza notificaciones y detalle cuando existe solicitud', async () => {
    const queryClient = client()

    await syncNotificationData(queryClient, {
      notificationType: 'NEW_CHAT_MESSAGE',
      requestId: 'request-1',
    })

    expect(invalidated(queryClient)).toEqual(expect.arrayContaining([
      notificationKeys.all,
      notificationKeys.unread,
      requestKeys.detail('request-1'),
      ['chat', 'request-1'],
    ]))
  })

  it.each([
    ['NEW_QUOTE', [requestKeys.quotes('request-1'), requestKeys.client]],
    ['NEW_REQUEST', [requestKeys.availableRoot]],
    ['QUOTE_ACCEPTED', [requestKeys.availableRoot, requestKeys.assigned, requestKeys.client]],
    ['SERVICE_COMPLETED', [requestKeys.client, requestKeys.assigned]],
    ['PAYMENT_PROOF_VERIFIED', [['payment-proofs'], ['service-evidence']]],
    ['NEW_RATING', [['ratings']]],
  ] as const)('invalida las cachés relacionadas con %s', async (type, expected) => {
    const queryClient = client()

    await syncNotificationData(queryClient, { type, requestId: 'request-1' })

    expect(invalidated(queryClient)).toEqual(expect.arrayContaining([...expected]))
  })
})
