import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import { useMutation } from '@tanstack/react-query'
import { StyleSheet, Text } from 'react-native'
import { AppBottomSheet, SheetPrimaryButton, SheetSecondaryButton, SheetTextButton } from '../../../components/AppBottomSheet'
import { Field, colors, styles } from '../../../components/UI'
import { apiMessage } from '../../../shared/apiMessage'
import { serviceSupportApi } from '../../service-support/api'

type PickedFile = {
  uri: string
  name: string
  mimeType: string
}

export function ReportIssueBottomSheet({
  visible,
  requestId,
  onSubmit,
  onClose,
}: {
  visible: boolean
  requestId?: string
  onSubmit: (description: string) => Promise<unknown>
  onClose: () => void
}) {
  const [description, setDescription] = useState('Problema de pago: el cliente no pagó el valor acordado.')
  const [file, setFile] = useState<PickedFile>()
  const submit = useMutation({
    mutationFn: async () => {
      if (!requestId) return
      await onSubmit(description.trim())
      if (file) {
        await serviceSupportApi.uploadEvidenceFile(requestId, 'OTHER', description.trim(), file)
      }
    },
    onSuccess: () => {
      setFile(undefined)
      setDescription('Problema de pago: el cliente no pagó el valor acordado.')
      onClose()
    },
  })

  async function pickEvidence() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    if (asset) setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf' })
  }

  return <AppBottomSheet
    visible={visible}
    title="Reportar problema de pago"
    message="Registra lo ocurrido. Puedes adjuntar una evidencia para que soporte revise el caso."
    onClose={onClose}
  >
    <Text style={local.reason}>Motivo: Problema de pago</Text>
    <Field multiline value={description} onChangeText={setDescription} placeholder="Describe lo ocurrido" />
    {file && <Text style={styles.muted}>Evidencia: {file.name}</Text>}
    <SheetSecondaryButton title={file ? 'Cambiar evidencia' : 'Adjuntar evidencia'} onPress={() => void pickEvidence()} />
    {submit.error && <Text style={styles.error}>{apiMessage(submit.error)}</Text>}
    <SheetPrimaryButton
      title="Enviar reporte"
      loading={submit.isPending}
      disabled={!description.trim()}
      onPress={() => submit.mutate()}
    />
    <SheetTextButton title="Cancelar" onPress={onClose} />
  </AppBottomSheet>
}

const local = StyleSheet.create({
  reason: {
    color: colors.brand,
    fontWeight: '900',
    marginBottom: 12,
  },
})
