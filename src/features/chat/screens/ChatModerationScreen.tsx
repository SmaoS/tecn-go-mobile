import { useState } from 'react'
import { Text } from 'react-native'
import { Button, Card, Field, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { useSession } from '../../../context/useSession'
import { QueryState } from '../../../shared/QueryState'
import { useChatModerationAction, useChatModerationQueue } from '../moderation-hooks'

export function ChatModerationScreen() {
  const queue = useChatModerationQueue()
  const action = useChatModerationAction()
  const { session } = useSession()
  const [reasons, setReasons] = useState<Record<string, string>>({})
  return <KeyboardAwareScreen>
    <Text style={styles.title}>Moderación de chat</Text>
    <QueryState pending={queue.isPending} error={queue.error} empty={queue.data?.length === 0} emptyText="No hay mensajes pendientes.">
      <>{queue.data?.map((item) => <Card key={item.id}>
        <Text style={styles.cardTitle}>{item.senderName}</Text>
        <Text style={styles.muted}>{item.message}</Text>
        <Text style={styles.muted}>{item.moderationStatus} · {item.openReports} reportes</Text>
        {item.moderationReason && <Text style={styles.muted}>{item.moderationReason}</Text>}
        <Field placeholder="Motivo de la decisión" value={reasons[item.id] ?? ''} onChangeText={(value) =>
          setReasons({ ...reasons, [item.id]: value })} />
        <Button title="Aprobar mensaje" onPress={() => action.mutate({
          id: item.id, action: 'approve', reason: reasons[item.id] || 'Aprobado por revisión manual',
        })} loading={action.isPending} />
        <Button title="Bloquear mensaje" onPress={() => action.mutate({
          id: item.id, action: 'block', reason: reasons[item.id] || 'Bloqueado por revisión manual',
        })} loading={action.isPending} />
        {session?.role === 'ADMIN' && <Button title="Sancionar usuario" onPress={() => action.mutate({
          id: item.id, action: 'sanction', reason: reasons[item.id] || 'Contenido de chat prohibido',
        })} loading={action.isPending} />}
      </Card>)}</>
    </QueryState>
    {action.error && <Text style={styles.error}>No fue posible aplicar la decisión.</Text>}
  </KeyboardAwareScreen>
}
