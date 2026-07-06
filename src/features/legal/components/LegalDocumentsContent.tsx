import { Pressable, Text } from 'react-native'
import { Button, Card, colors, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { apiMessage } from '../../../shared/apiMessage'
import { useLegalDocuments } from '../hooks'

export function LegalDocumentsContent({
  onAccepted,
  buttonTitle = 'Aceptar todos los términos y condiciones',
  testID,
  onJumpToEnd,
}: {
  onAccepted?: () => void
  buttonTitle?: string
  testID?: string
  onJumpToEnd?: () => void
}) {
  const { documents, acceptAll } = useLegalDocuments()
  const pendingDocuments = documents.data?.filter((document) => !document.accepted) ?? []

  return <QueryState pending={documents.isPending} error={documents.error}>
    {onJumpToEnd && <Pressable
      onPress={onJumpToEnd}
      style={{ borderColor: colors.brand, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center' }}
    >
      <Text style={{ color: colors.brand, fontWeight: '800' }}>Ir al final ↓</Text>
    </Pressable>}
    {documents.data?.map((document) => <Card key={document.id}>
      <Text style={styles.cardTitle}>{document.title} · v{document.version}</Text>
      <Text style={[styles.muted, { lineHeight: 22 }]}>{document.content}</Text>
    </Card>)}
    {acceptAll.error && <Text style={styles.error}>{apiMessage(acceptAll.error)}</Text>}
    <Button
      testID={testID}
      title={pendingDocuments.length === 0 ? 'Términos y condiciones aceptados' : buttonTitle}
      disabled={pendingDocuments.length === 0}
      loading={acceptAll.isPending}
      onPress={() => acceptAll.mutate(undefined, { onSuccess: onAccepted })}
    />
  </QueryState>
}
