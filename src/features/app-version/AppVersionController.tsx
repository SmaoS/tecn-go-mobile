import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import type { AppVersionCheck } from '../../types'
import { AppVersionModal } from './AppVersionGate'
import { checkAppVersion } from './VersionCheckService'

export function AppVersionController() {
  const [versionCheck, setVersionCheck] = useState<AppVersionCheck>()
  const appState = useRef<AppStateStatus>(AppState.currentState)
  const checking = useRef(false)
  const forceUpdate = useRef(false)

  const runCheck = useCallback(async () => {
    if (checking.current || forceUpdate.current) return
    checking.current = true
    try {
      const result = await checkAppVersion()
      if (result) {
        forceUpdate.current = result.forceUpdate
        setVersionCheck(result)
      }
    } finally {
      checking.current = false
    }
  }, [])

  useEffect(() => {
    void runCheck()
  }, [runCheck])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appState.current
      appState.current = nextState
      if ((previous === 'background' || previous === 'inactive') && nextState === 'active') {
        void runCheck()
      }
    })
    return () => subscription.remove()
  }, [runCheck])

  return <AppVersionModal
    check={versionCheck}
    onContinue={() => {
      if (!versionCheck?.forceUpdate) {
        forceUpdate.current = false
        setVersionCheck(undefined)
      }
    }}
  />
}
