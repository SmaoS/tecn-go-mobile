import { act, renderHook, waitFor } from '@testing-library/react-native'
import { createQueryWrapper } from '../../test/render'
import { notificationFixture } from '../../test/fixtures'
import { notificationsApi } from './api'
import {
  notificationKeys,
  useDeleteNotification,
  useMarkNotificationRead,
  useNotifications,
} from './hooks'

jest.mock('./api', () => ({
  notificationsApi: {
    all: jest.fn(),
    unread: jest.fn(),
    read: jest.fn(),
    delete: jest.fn(),
  },
}))
jest.mock('../../hooks/useSmartPolling', () => ({
  useSmartPolling: jest.fn(() => ({ enabled: true, refetchInterval: false })),
}))

describe('notification hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fusiona notificaciones incrementales, elimina duplicados y ordena recientes primero', async () => {
    const { queryClient, QueryWrapper } = createQueryWrapper()
    queryClient.setQueryData(notificationKeys.all, [
      notificationFixture({ id: 'old', createdAt: '2026-06-22T10:00:00Z' }),
    ])
    jest.mocked(notificationsApi.all).mockResolvedValue([
      notificationFixture({ id: 'new', createdAt: '2026-06-22T10:01:00Z' }),
      notificationFixture({ id: 'old', createdAt: '2026-06-22T10:00:00Z', read: true }),
    ])

    const hook = renderHook(useNotifications, { wrapper: QueryWrapper })

    await waitFor(() => expect(hook.result.current.data).toHaveLength(2))
    expect(notificationsApi.all).toHaveBeenCalledWith('2026-06-22T10:00:00Z')
    expect(hook.result.current.data?.map((item) => item.id)).toEqual(['new', 'old'])
    expect(hook.result.current.data?.find((item) => item.id === 'old')?.read).toBe(true)
  })

  it('actualiza optimistamente leído y elimina elementos del caché', async () => {
    const initial = [
      notificationFixture({ id: 'one' }),
      notificationFixture({ id: 'two' }),
    ]
    const { queryClient, QueryWrapper } = createQueryWrapper()
    queryClient.setQueryData(notificationKeys.all, initial)
    jest.mocked(notificationsApi.read).mockResolvedValue({} as never)
    jest.mocked(notificationsApi.delete).mockResolvedValue({} as never)
    const read = renderHook(useMarkNotificationRead, { wrapper: QueryWrapper })
    const remove = renderHook(useDeleteNotification, { wrapper: QueryWrapper })

    await act(async () => {
      await read.result.current.mutateAsync({ id: 'one', read: false })
    })
    expect(queryClient.getQueryData<typeof initial>(notificationKeys.all)?.[0]?.read).toBe(true)

    await act(async () => { await remove.result.current.mutateAsync('two') })
    expect(queryClient.getQueryData<typeof initial>(notificationKeys.all)?.map((item) => item.id))
      .toEqual(['one'])
  })
})
