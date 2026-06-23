import { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, colors, Screen, styles } from '../../../components/UI'
import type { RootStackParamList } from '../../../types'

export function CaptureIdentityDocumentScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'CaptureIdentityDocument'>) {
  const camera = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [captured, setCaptured] = useState(false)
  const [frontUri, setFrontUri] = useState<string>()
  const [backUri, setBackUri] = useState<string>()
  const [singleUri, setSingleUri] = useState<string>()
  const [previewSide, setPreviewSide] = useState<'front' | 'back' | 'passport'>()
  const documentType = route.params.documentType
  const side = documentType === 'PASSPORT' ? 'passport' : frontUri ? 'back' : 'front'
  const previewUri = previewSide === 'passport' ? singleUri : previewSide === 'back' ? backUri : previewSide === 'front' ? frontUri : undefined

  useEffect(() => {
    if (!ready || captured || previewUri) return
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
  }, [ready, captured, previewUri, side])

  async function takePhoto() {
    if (captured) return
    setCaptured(true)
    const photo = await camera.current?.takePictureAsync({ quality: 0.85 })
    if (!photo?.uri) {
      setCaptured(false)
      setCountdown(5)
      return
    }
    if (documentType === 'PASSPORT') {
      setSingleUri(photo.uri)
      setPreviewSide('passport')
    } else if (side === 'front') {
      setFrontUri(photo.uri)
      setPreviewSide('front')
    } else {
      setBackUri(photo.uri)
      setPreviewSide('back')
    }
  }

  function repeat() {
    if (previewSide === 'passport') setSingleUri(undefined)
    else if (previewSide === 'front') setFrontUri(undefined)
    else setBackUri(undefined)
    setPreviewSide(undefined)
    setCaptured(false)
    setCountdown(5)
  }

  function usePhoto() {
    if (documentType === 'CC' && previewSide === 'front') {
      setPreviewSide(undefined)
      setCaptured(false)
      setCountdown(5)
      return
    }
    navigation.navigate('OnboardingRequired', {
      documentFrontUri: frontUri,
      documentBackUri: backUri,
      documentSingleUri: singleUri,
      identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED',
    })
  }

  if (!permission?.granted) {
    return <Screen>
      <Text style={styles.title}>Documento de identidad</Text>
      <Text style={styles.subtitle}>Usaremos la cámara trasera para capturar el documento dentro del marco.</Text>
      <Button title="Permitir cámara" onPress={() => void requestPermission()} />
    </Screen>
  }

  if (previewUri) {
    return <View style={local.container}>
      <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={local.previewPanel}>
        <Text style={local.title}>Foto capturada correctamente.</Text>
        <Button title={documentType === 'CC' && previewSide === 'front'
          ? 'Enviar y continuar'
          : 'Continuar'} onPress={usePhoto} />
        <Button title="Repetir" onPress={repeat} />
      </View>
    </View>
  }

  return <View style={local.container}>
    <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setReady(true)} />
    <View style={local.overlay}>
      <View style={local.frame} />
      <Text style={local.title}>{side === 'back' ? 'Ubica el reverso dentro del marco.' : documentType === 'PASSPORT' ? 'Ubica el pasaporte dentro del marco.' : 'Ubica el frente dentro del marco.'}</Text>
      <Text style={local.tip}>Evita reflejos y sombras.</Text>
      <Text style={local.help}>{ready ? `Captura guiada... ${countdown}` : 'Preparando cámara...'}</Text>
      <Button title="Tomar foto para revisión" onPress={() => void takePhoto()} />
    </View>
  </View>
}

const local = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 46 },
  frame: { alignSelf: 'center', position: 'absolute', top: '20%', width: '86%', height: 235, borderRadius: 20, borderWidth: 4, borderColor: colors.brand, backgroundColor: 'rgba(0,216,74,.06)' },
  title: { color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: '900', backgroundColor: 'rgba(2,6,23,.74)', padding: 12, borderRadius: 14 },
  tip: { color: colors.text, textAlign: 'center', marginTop: 10 },
  help: { color: colors.brand, textAlign: 'center', fontSize: 22, fontWeight: '900', marginVertical: 12 },
  previewPanel: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 46, backgroundColor: 'rgba(2,6,23,.25)' },
})
