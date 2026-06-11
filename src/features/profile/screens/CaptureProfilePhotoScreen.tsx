import { useRef, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Button, colors, Screen, styles } from '../../../components/UI'
import { useCaptureProfilePhoto } from '../hooks'

export function CaptureProfilePhotoScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const camera = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [ready, setReady] = useState(false)
  const capture = useCaptureProfilePhoto(() => {
      Alert.alert('Foto enviada', 'La detección facial automática no está activa. La foto quedará pendiente de revisión manual.')
      navigation.goBack()
  })
  async function takePhoto() {
    const photo = await camera.current?.takePictureAsync({ quality: 0.8 })
    if (!photo) {
      Alert.alert('No fue posible tomar la foto')
      return
    }
    capture.mutate(photo.uri)
  }
  if (!permission?.granted) return <Screen><Text style={styles.title}>Foto de perfil</Text><Text style={styles.subtitle}>Usaremos la cámara frontal para capturar una foto clara de tu rostro.</Text><Button title="Permitir cámara" onPress={() => void requestPermission()} /></Screen>
  return <View style={local.container}><CameraView ref={camera} style={StyleSheet.absoluteFill} facing="front" onCameraReady={() => setReady(true)} />
    <View style={local.guide}><View style={local.oval} /><Text style={local.help}>Centra tu rostro, usa buena iluminación y evita accesorios que lo oculten.</Text><Button title="Tomar foto" loading={capture.isPending} onPress={() => ready && void takePhoto()} /></View>
  </View>
}
const local = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  guide: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 48 },
  oval: { alignSelf: 'center', position: 'absolute', top: '18%', width: 230, height: 310, borderRadius: 120, borderWidth: 3, borderColor: colors.brand },
  help: { color: colors.text, textAlign: 'center', marginBottom: 14, backgroundColor: 'rgba(2,6,23,.75)', padding: 12, borderRadius: 12 },
})
