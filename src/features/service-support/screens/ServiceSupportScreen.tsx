import { useState } from 'react'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList } from '../../../types'
import type { EvidenceType, ProofMethod } from '../api'
import { useServiceSupport } from '../hooks'

const evidenceLabels: Record<EvidenceType, string> = {
  BEFORE_SERVICE: 'Antes del servicio',
  DURING_SERVICE: 'Durante el servicio',
  AFTER_SERVICE: 'Después del servicio',
  DAMAGE_REPORT: 'Reporte de daño',
  OTHER: 'Otra evidencia',
}

export function ServiceSupportScreen({ route }: NativeStackScreenProps<RootStackParamList, 'ServiceSupport'>) {
  const requestId = route.params.requestId
  const { evidences, proofs, action } = useServiceSupport(requestId)
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('BEFORE_SERVICE')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<ProofMethod>('TRANSFER')
  const [report, setReport] = useState('')
  return <KeyboardAwareScreen>
    <Text style={styles.title}>Soporte del servicio</Text>
    <Card><Text style={styles.cardTitle}>Evidencias</Text>
      <Text style={styles.muted}>Tipo: {evidenceLabels[evidenceType]}</Text>
      <Button title="Cambiar tipo de evidencia" onPress={() => {
        const values = Object.keys(evidenceLabels) as EvidenceType[]
        setEvidenceType(values[(values.indexOf(evidenceType) + 1) % values.length] ?? 'BEFORE_SERVICE')
      }} />
      <Field value={description} onChangeText={setDescription} placeholder="Descripción" />
      <Button title="Elegir y subir evidencia" loading={action.isPending} onPress={() => action.mutate({ kind: 'evidence', evidenceType, description })} />
      {evidences.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.description || evidenceLabels[item.evidenceType]} · {item.uploadedByName}</Text>)}
    </Card>
    <Card><Text style={styles.cardTitle}>Comprobante de pago</Text>
      <Field keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="Monto" />
      <Field value={method} onChangeText={(value) => setMethod(value as ProofMethod)} placeholder="TRANSFER" autoCapitalize="characters" />
      <Button title="Elegir y subir comprobante" loading={action.isPending} onPress={() => action.mutate({ kind: 'proof', amount: Number(amount), paymentMethod: method })} />
      {proofs.data?.map((item) => <Text key={item.id} style={styles.muted}>${item.amount.toLocaleString()} · {item.status}{item.reviewComment ? ` · ${item.reviewComment}` : ''}</Text>)}
    </Card>
    <Card><Text style={styles.cardTitle}>Reportar problema</Text><Field multiline value={report} onChangeText={setReport} placeholder="Describe lo ocurrido" />
      <Button title="Enviar denuncia" loading={action.isPending} onPress={() => action.mutate({ kind: 'report', description: report })} />
    </Card>
    {action.error && <Text style={styles.error}>{apiMessage(action.error)}</Text>}
  </KeyboardAwareScreen>
}
