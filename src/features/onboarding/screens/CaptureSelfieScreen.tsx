import { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, colors, Screen, styles } from '../../../components/UI'
import type { RootStackParamList } from '../../../types'

export function CaptureSelfieScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'CaptureSelfie'>) {
  const camera = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [photoUri, setPhotoUri] = useState<string>()
  const [captured, setCaptured] = useState(false)

  useEffect(() => {
    if (!ready || captured || photoUri) return
    const interval = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          clearInterval(interval)
          void takePhoto()
          return 0
        }
        return value - 1
      })
    }, 900)
    return () => clearInterval(interval)
  }, [ready, captured, photoUri])

  async function takePhoto() {
    if (captured) return
    setCaptured(true)
    const photo = await camera.current?.takePictureAsync({ quality: 0.82 })
    if (!photo?.uri) {
      setCaptured(false)
      setCountdown(3)
      return
    }
    setPhotoUri(photo.uri)
  }

  function repeat() {
    setPhotoUri(undefined)
    setCaptured(false)
    setCountdown(3)
  }

  if (!permission?.granted) {
    return <Screen>
      <Text style={styles.title}>Selfie de perfil</Text>
      <Text style={styles.subtitle}>Ubica tu rostro dentro del óvalo. No hacemos reconocimiento facial, solo validación visual para revisión.</Text>
      <Button title="Permitir cámara" onPress={() => void requestPermission()} />
    </Screen>
  }

  if (photoUri) {
    return <View style={local.container}>
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} />
      <View style={local.previewPanel}>
        <Text style={local.title}>Foto capturada correctamente.</Text>
        <Button title="Usar foto" onPress={() => navigation.navigate('OnboardingRequired', {
          selfieUri: photoUri,
          faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
        })} />
        <Button title="Repetir" onPress={repeat} />
      </View>
    </View>
  }

  return <View style={local.container}>
    <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="front" onCameraReady={() => setReady(true)} />
    <View style={local.overlay}>
      <View style={local.oval} />
      <Text style={local.title}>Ubica tu rostro dentro del óvalo.</Text>
      <Text style={local.help}>{ready ? `Mantente quieto... ${countdown}` : 'Preparando cámara...'}</Text>
      <Button title="Tomar foto" onPress={() => void takePhoto()} />
    </View>
  </View>
}

const local = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 46 },
  oval: { alignSelf: 'center', position: 'absolute', top: '16%', width: 235, height: 315, borderRadius: 130, borderWidth: 4, borderColor: colors.brand, backgroundColor: 'rgba(34,211,238,.05)' },
  title: { color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: '900', backgroundColor: 'rgba(2,6,23,.74)', padding: 12, borderRadius: 14 },
  help: { color: colors.brand, textAlign: 'center', fontSize: 22, fontWeight: '900', marginVertical: 12 },
  previewPanel: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 46, backgroundColor: 'rgba(2,6,23,.25)' },
})
