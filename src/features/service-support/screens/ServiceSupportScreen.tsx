import { useState } from 'react'
import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList } from '../../../types'
import type { EvidenceType, ProofMethod } from '../api'
import { useServiceSupport } from '../hooks'

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
      <Field value={evidenceType} onChangeText={(value) => setEvidenceType(value as EvidenceType)} placeholder="BEFORE_SERVICE" autoCapitalize="characters" />
      <Field value={description} onChangeText={setDescription} placeholder="Descripción" />
      <Button title="Elegir y subir evidencia" loading={action.isPending} onPress={() => action.mutate({ kind: 'evidence', evidenceType, description })} />
      {evidences.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.evidenceType} · {item.uploadedByName}</Text>)}
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
