import { createContext } from 'react'
import type { Session } from '../types'

export interface SessionContextValue {
  session: Session | null
  ready: boolean
  setSession: (session: Session | null) => void
  switchMode: (mode: 'CLIENT' | 'TECHNICIAN') => Promise<void>
  logout: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)
