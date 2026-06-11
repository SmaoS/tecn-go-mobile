import { useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  const callbackRef = useRef(callback)
  const runningRef = useRef(false)
  callbackRef.current = callback

  useFocusEffect(useCallback(() => {
    let active = true
    const run = async () => {
      if (!active || runningRef.current) return
      runningRef.current = true
      try {
        await callbackRef.current()
      } finally {
        runningRef.current = false
      }
    }
    void run()
    const interval = setInterval(() => void run(), intervalMs)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [intervalMs]))
}
