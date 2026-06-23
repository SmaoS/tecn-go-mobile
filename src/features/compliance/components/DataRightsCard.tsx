import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Share, Text } from 'react-native'
import { Button, Card, styles } from '../../../components/UI'
import { showToast } from '../../../components/Toast'
import { apiMessage } from '../../../shared/apiMessage'
import { complianceApi } from '../api'
import { ConfirmDialog } from '../../../components/ConfirmDialog'

export function DataRightsCard() {
  const [confirmVisible, setConfirmVisible] = useState(false)
  const exportData = useMutation({
    mutationFn: complianceApi.exportMine,
    onSuccess: async (result) => {
      await Share.share({
        title: 'Mis datos de TecnGo',
        message: JSON.stringify(result, null, 2),
      })
      showToast('Copia de datos generada')
    },
    onError: (error) => showToast(apiMessage(error), 'error'),
  })
  const anonymize = useMutation({
    mutationFn: complianceApi.requestAnonymization,
    onSuccess: () => showToast('Solicitud de anonimización enviada para revisión'),
    onError: (error) => showToast(apiMessage(error), 'error'),
  })

  return <Card>
    <Text style={styles.cardTitle}>Privacidad y datos</Text>
    <Text style={styles.muted}>Obtén una copia de tus datos o solicita anonimizar tu cuenta.</Text>
    <Button title="Exportar mis datos" onPress={() => exportData.mutate()} loading={exportData.isPending} />
    <Button title="Solicitar anonimización" onPress={() => setConfirmVisible(true)} loading={anonymize.isPending} />
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
