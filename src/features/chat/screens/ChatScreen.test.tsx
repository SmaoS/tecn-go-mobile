import { fireEvent, render } from '@testing-library/react-native'
import { sessionFixture } from '../../../test/fixtures'
import { SessionContext } from '../../../context/session-context'
import { createSessionContext } from '../../../test/render'
import { ChatScreen } from './ChatScreen'
import { useChat, useReportMessage, useSendMessage } from '../hooks'

jest.mock('../hooks', () => ({
  useChat: jest.fn(),
  useSendMessage: jest.fn(),
  useReportMessage: jest.fn(),
}))

describe('ChatScreen', () => {
  const send = jest.fn()
  const report = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useChat).mockReturnValue({
      data: [
        {
          id: 'mine',
          senderId: 'user-client-1',
          senderName: 'Cliente',
          message: 'Mi mensaje',
          moderationStatus: 'APPROVED',
          createdAt: '2026-06-22T10:00:00Z',
        },
        {
          id: 'other',
          senderId: 'user-technician-1',
          senderName: 'Técnico',
          message: 'Mensaje por revisar',
          moderationStatus: 'FLAGGED',
          createdAt: '2026-06-22T10:01:00Z',
        },
      ],
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useSendMessage).mockReturnValue({
      mutate: send,
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useReportMessage).mockReturnValue({
      mutate: report,
      isPending: false,
      error: null,
    } as never)
  })

  function renderScreen() {
    return render(
      <SessionContext.Provider value={createSessionContext(sessionFixture())}>
        <ChatScreen route={{ params: { requestId: 'request-1' } } as never} navigation={{} as never} />
      </SessionContext.Provider>,
    )
  }

  it('sends non-empty messages and clears the field after success', () => {
    send.mockImplementation((_message, options) => options.onSuccess())
    const view = renderScreen()
    const input = view.getByPlaceholderText('Escribe un mensaje')

    fireEvent.changeText(input, 'Hola técnico')
    fireEvent.press(view.getByText('Enviar'))

    expect(send).toHaveBeenCalledWith('Hola técnico', expect.any(Object))
    expect(input.props.value).toBe('')
  })

  it('shows moderation state and only reports messages from other users', () => {
    const view = renderScreen()

    expect(view.getByText('Mensaje enviado a revisión')).toBeTruthy()
    expect(view.getAllByText('Reportar mensaje')).toHaveLength(1)
    fireEvent.press(view.getByText('Reportar mensaje'))
    expect(report).toHaveBeenCalledWith('other')
  })
})
