import { useEffect, useRef } from 'react'
import { BackHandler, ScrollView, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { showToast } from '../../../components/Toast'
import type { RootStackParamList } from '../../../types'
import { LegalDocumentsContent } from '../components/LegalDocumentsContent'

export function LegalScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Legal'>) {
  const required = route.params?.required === true
  const scrollRef = useRef<ScrollView | null>(null)

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !required,
      headerBackVisible: !required,
    })
    if (!required) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => subscription.remove()
  }, [navigation, required])

  return <KeyboardAwareScreen scrollRef={scrollRef}>
    <Text style={styles.title}>Seguridad, términos y tratamiento de datos</Text>
    <Text style={styles.subtitle}>{required
      ? 'Debes leer y aceptar los documentos vigentes para continuar con la operación.'
      : 'Lee todos los documentos. Al final puedes aceptarlos en una sola acción.'}</Text>
    <LegalDocumentsContent onJumpToEnd={() => scrollRef.current?.scrollToEnd({ animated: true })} onAccepted={() => {
      showToast('Términos y condiciones aceptados')
      if (navigation.canGoBack()) navigation.goBack()
    }} />
  </KeyboardAwareScreen>
}
