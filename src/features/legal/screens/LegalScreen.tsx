import { Text } from 'react-native'
import { Button, Card, Screen, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import { useLegalDocuments } from '../hooks'
export function LegalScreen() {
  const { documents, accept } = useLegalDocuments()
  return <Screen><QueryState pending={documents.isPending} error={documents.error}><Text style={styles.title}>Seguridad y términos</Text><Text style={styles.subtitle}>Borrador sujeto a revisión jurídica.</Text>
    {documents.data?.map((item) => <Card key={item.id}><Text style={styles.cardTitle}>{item.title} · v{item.version}</Text><Text style={styles.muted}>{item.content}</Text><Button title={item.accepted ? 'Aceptado' : 'Aceptar'} loading={accept.isPending} onPress={() => !item.accepted && accept.mutate(item.id)} /></Card>)}
  </QueryState></Screen>
}
