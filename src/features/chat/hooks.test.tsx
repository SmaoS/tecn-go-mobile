import { act, renderHook, waitFor } from '@testing-library/react-native'
import { createQueryWrapper } from '../../test/render'
import { chatApi } from './api'
import { chatKey, useChat, useReportMessage, useSendMessage } from './hooks'
import type { ChatMessage } from '../../types'

jest.mock('./api', () => ({
  chatApi: {
    messages: jest.fn(),
    read: jest.fn(),
    send: jest.fn(),
    report: jest.fn(),
  },
}))
jest.mock('../../hooks/useSmartPolling', () => ({
  CHAT_POLLING_MS: 5000,
  useSmartPolling: jest.fn(() => ({ enabled: true, refetchInterval: false })),
}))

const message = (id: string, createdAt: string): ChatMessage => ({
  id,
  senderId: 'user-1',
  senderName: 'Usuario',
  message: id,
  moderationStatus: 'APPROVED',
  createdAt,
})

describe('chat hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('consulta incrementalmente, fusiona sin duplicados y marca leído', async () => {
    const { queryClient, QueryWrapper } = createQueryWrapper()
    queryClient.setQueryData(chatKey('request-1'), [
      message('old', '2026-06-22T10:00:00Z'),
    ])
    jest.mocked(chatApi.messages).mockResolvedValue([
      message('new', '2026-06-22T10:01:00Z'),
      message('old', '2026-06-22T10:00:00Z'),
    ])
    jest.mocked(chatApi.read).mockResolvedValue({} as never)

    const hook = renderHook(() => useChat('request-1'), { wrapper: QueryWrapper })

    await waitFor(() => expect(hook.result.current.data).toHaveLength(2))
    expect(chatApi.messages).toHaveBeenCalledWith('request-1', '2026-06-22T10:00:00Z')
    expect(chatApi.read).toHaveBeenCalledWith('request-1')
    expect(hook.result.current.data?.map((item) => item.id)).toEqual(['old', 'new'])
  })

  it('invalida el chat después de enviar o reportar un mensaje', async () => {
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    jest.mocked(chatApi.send).mockResolvedValue({} as never)
    jest.mocked(chatApi.report).mockResolvedValue({} as never)
    const send = renderHook(() => useSendMessage('request-1'), { wrapper: QueryWrapper })
    const report = renderHook(() => useReportMessage('request-1'), { wrapper: QueryWrapper })

    await act(async () => { await send.result.current.mutateAsync('Hola') })
    await act(async () => { await report.result.current.mutateAsync('message-1') })

    expect(chatApi.send).toHaveBeenCalledWith('request-1', 'Hola')
    expect(chatApi.report).toHaveBeenCalledWith(
      'message-1',
      'Contenido inapropiado reportado desde la aplicación móvil',
    )
    expect(invalidate).toHaveBeenCalledWith({ queryKey: chatKey('request-1') })
  })
})
