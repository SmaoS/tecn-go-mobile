import { useCallback, useRef } from 'react'
import { BackHandler, Platform, ToastAndroid } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

export function useDoubleBackExit(enabled = true) {
  const lastPress = useRef(0)
  useFocusEffect(useCallback(() => {
    if (!enabled || Platform.OS !== 'android') return undefined
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const now = Date.now()
      if (now - lastPress.current <= 2_000) {
        BackHandler.exitApp()
        return true
      }
      lastPress.current = now
      ToastAndroid.show('Pulse nuevamente para cerrar la aplicación', ToastAndroid.SHORT)
      return true
    })
    return () => subscription.remove()
  }, [enabled]))
}
