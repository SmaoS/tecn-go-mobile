import { useState } from 'react'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { useChat, useReportMessage, useSendMessage } from '../hooks'

export function ChatScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  const [message, setMessage] = useState('')
  const messages = useChat(route.params.requestId)
  const send = useSendMessage(route.params.requestId)
  const report = useReportMessage(route.params.requestId)
  const { session } = useSession()
  function submit() {
    if (!message.trim()) return
    send.mutate(message, { onSuccess: () => setMessage('') })
  }
  return <KeyboardAwareScreen><Text style={styles.title}>Chat</Text><QueryState pending={messages.isPending} error={messages.error} empty={messages.data?.length === 0} emptyText="Inicia la conversación.">
    <>{messages.data?.map((item) => <Card key={item.id}>
      <Text style={styles.cardTitle}>{item.senderName}</Text>
      <Text style={styles.muted}>{item.message}</Text>
      {item.moderationStatus === 'FLAGGED' && <Text style={styles.muted}>Mensaje enviado a revisión</Text>}
      {item.senderId !== session?.userId && item.moderationStatus !== 'BLOCKED' &&
        <Button title="Reportar mensaje" onPress={() => report.mutate(item.id)} loading={report.isPending} />}
    </Card>)}</>
  </QueryState>
    <Field placeholder="Escribe un mensaje" value={message} onChangeText={setMessage} />
    {(send.error || report.error) && <Text style={styles.error}>No fue posible completar la operación.</Text>}
    <Button title="Enviar" onPress={submit} loading={send.isPending} />
  </KeyboardAwareScreen>
}
