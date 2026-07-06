import { useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Button, colors, Screen, styles } from '../../../components/UI'
import { useCaptureProfilePhoto } from '../hooks'
import { showToast } from '../../../components/Toast'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadProfileAsset } from '../../../services/files'
import { complianceApi } from '../../compliance/api'

type Props = NativeStackScreenProps<RootStackParamList, 'CaptureProfilePhoto'>

export function CaptureProfilePhotoScreen({ navigation, route }: Props) {
  const camera = useRef<CameraView>(null)
  const queryClient = useQueryClient()
  const [permission, requestPermission] = useCameraPermissions()
  const [ready, setReady] = useState(false)
  const purpose = route.params?.purpose ?? 'PROFILE_UPDATE'
  const capture = useCaptureProfilePhoto(() => {
      showToast('Foto enviada. Quedará pendiente de revisión manual.', 'info')
      navigation.goBack()
  })
  const requestSelfieChange = useMutation({
    mutationFn: async (uri: string) => {
      const url = await uploadProfileAsset({
        uri,
        name: `profile-selfie-change-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      })
      return complianceApi.requestProfileSelfieChange(url)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['compliance', 'profile-selfie-changes'] })
      showToast('Selfie enviada para revisión. Tu foto actual seguirá activa hasta ser aprobada.', 'info')
      navigation.goBack()
    },
    onError: () => showToast('No fue posible solicitar el cambio de selfie', 'error'),
  })
  async function takePhoto() {
    const photo = await camera.current?.takePictureAsync({ quality: 0.8 })
    if (!photo) {
      showToast('No fue posible tomar la foto', 'error')
      return
    }
    if (purpose === 'SELFIE_CHANGE_REQUEST') {
      requestSelfieChange.mutate(photo.uri)
      return
    }
    capture.mutate(photo.uri)
  }
  const loading = purpose === 'SELFIE_CHANGE_REQUEST' ? requestSelfieChange.isPending : capture.isPending
  if (!permission?.granted) return <Screen><Text style={styles.title}>Foto de perfil</Text><Text style={styles.subtitle}>Usaremos la cámara frontal para capturar una foto clara de tu rostro.</Text><Button title="Permitir cámara" onPress={() => void requestPermission()} /></Screen>
  return <View style={local.container}><CameraView ref={camera} style={StyleSheet.absoluteFill} facing="front" onCameraReady={() => setReady(true)} />
    <View style={local.guide}><View style={local.oval} /><Text style={local.help}>Centra tu rostro, usa buena iluminación y evita accesorios que lo oculten.</Text><Button title={purpose === 'SELFIE_CHANGE_REQUEST' ? 'Solicitar cambio de selfie' : 'Tomar foto'} loading={loading} onPress={() => ready && void takePhoto()} /></View>
  </View>
}
const local = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  guide: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 48 },
  oval: { alignSelf: 'center', position: 'absolute', top: '18%', width: 230, height: 310, borderRadius: 120, borderWidth: 3, borderColor: colors.brand },
  help: { color: colors.text, textAlign: 'center', marginBottom: 14, backgroundColor: 'rgba(2,6,23,.75)', padding: 12, borderRadius: 12 },
})
