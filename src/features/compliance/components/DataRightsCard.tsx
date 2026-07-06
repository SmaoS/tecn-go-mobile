import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Text } from 'react-native'
import { Button, Card, styles } from '../../../components/UI'
import { showToast } from '../../../components/Toast'
import { apiMessage } from '../../../shared/apiMessage'
import { complianceApi, type DataRequestStatus } from '../api'
import { ConfirmDialog } from '../../../components/ConfirmDialog'

const statusLabel: Record<DataRequestStatus, string> = {
  PENDING: 'Pendiente de revisión',
  APPROVED: 'Aprobada',
  SENT: 'Enviada al correo',
  COMPLETED: 'Completada',
  REJECTED: 'Rechazada',
}

export function DataRightsCard({ onCaptureSelfie }: { onCaptureSelfie?: () => void }) {
  const queryClient = useQueryClient()
  const [confirmVisible, setConfirmVisible] = useState(false)
  const exports = useQuery({
    queryKey: ['compliance', 'exports'],
    queryFn: complianceApi.exportRequests,
  })
  const selfieChanges = useQuery({
    queryKey: ['compliance', 'profile-selfie-changes'],
    queryFn: complianceApi.profileSelfieChangeRequests,
  })
  const exportData = useMutation({
    mutationFn: complianceApi.requestExport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['compliance', 'exports'] })
      showToast('Solicitud creada. Te enviaremos el archivo al correo')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const anonymize = useMutation({
    mutationFn: complianceApi.requestAnonymization,
    onSuccess: () => showToast('Solicitud de anonimización enviada para revisión'),
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const selfieChangePending = selfieChanges.data?.some((item) => item.status === 'PENDING') ?? false

  return <Card>
    <Text style={styles.cardTitle}>Privacidad y datos</Text>
    <Text style={styles.muted}>Solicita una copia de tus datos o pide anonimizar tu cuenta.</Text>
    {exports.data?.[0] ? <Text style={styles.muted}>
      Última exportación: {statusLabel[exports.data[0].status]}
      {exports.data[0].rejectionReason ? ` · ${exports.data[0].rejectionReason}` : ''}
    </Text> : null}
    {selfieChanges.data?.[0] ? <Text style={styles.muted}>
      Cambio de selfie: {statusLabel[selfieChanges.data[0].status]}
      {selfieChanges.data[0].rejectionReason ? ` · ${selfieChanges.data[0].rejectionReason}` : ''}
    </Text> : null}
    <Button title="Solicitar exportación de mis datos" onPress={() => exportData.mutate()} loading={exportData.isPending} />
    <Button title="Solicitar anonimización" onPress={() => setConfirmVisible(true)} loading={anonymize.isPending} />
    {onCaptureSelfie && <Button
      title={selfieChangePending ? 'Cambio de selfie pendiente' : 'Solicitar cambio de selfie'}
      onPress={onCaptureSelfie}
      disabled={selfieChangePending}
    />}
    <ConfirmDialog
      visible={confirmVisible}
      title="Anonimizar cuenta"
      message="La cuenta se cerrará cuando un administrador apruebe la solicitud. ¿Deseas continuar?"
      confirmLabel="Enviar solicitud"
      danger
      loading={anonymize.isPending}
      onClose={() => setConfirmVisible(false)}
      onConfirm={() => anonymize.mutate(undefined, { onSuccess: () => setConfirmVisible(false) })}
    />
  </Card>
}
