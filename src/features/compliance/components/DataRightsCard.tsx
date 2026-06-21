import { useMutation } from '@tanstack/react-query'
import { Alert, Share, Text } from 'react-native'
import { Button, Card, styles } from '../../../components/UI'
import { showToast } from '../../../components/Toast'
import { apiMessage } from '../../../shared/apiMessage'
import { complianceApi } from '../api'

export function DataRightsCard() {
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

  function confirmAnonymization() {
    Alert.alert(
      'Anonimizar cuenta',
      'La cuenta se cerrará cuando un administrador apruebe la solicitud. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar solicitud', style: 'destructive', onPress: () => anonymize.mutate() },
      ],
    )
  }

  return <Card>
    <Text style={styles.cardTitle}>Privacidad y datos</Text>
    <Text style={styles.muted}>Obtén una copia de tus datos o solicita anonimizar tu cuenta.</Text>
    <Button title="Exportar mis datos" onPress={() => exportData.mutate()} loading={exportData.isPending} />
    <Button title="Solicitar anonimización" onPress={confirmAnonymization} loading={anonymize.isPending} />
  </Card>
}
