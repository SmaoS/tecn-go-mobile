import type { ReactNode } from 'react'
import { Text } from 'react-native'
import { styles } from '../components/UI'
import { apiMessage } from './apiMessage'

export function QueryState({ pending, error, empty, emptyText = 'No hay información disponible.', children }: {
  pending: boolean
  error: unknown
  empty?: boolean
  emptyText?: string
  children: ReactNode
}) {
  if (pending) return <Text style={styles.muted}>Cargando...</Text>
  if (error) return <Text style={styles.error}>{apiMessage(error)}</Text>
  if (empty) return <Text style={styles.muted}>{emptyText}</Text>
  return children
}
