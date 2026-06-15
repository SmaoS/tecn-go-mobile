import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { Screen, styles } from '../../../components/UI'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useAssignedRequests } from '../../service-requests/hooks'

export function TechnicianEntryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'TechnicianEntry'>) {
  const requests = useAssignedRequests()
  useEffect(() => {
    if (requests.isError) {
      navigation.replace('AvailableRequests')
      return
    }
    if (!requests.data) return
    navigation.replace(requests.data.length > 0 ? 'TechnicianHome' : 'AvailableRequests')
  }, [navigation, requests.data, requests.isError])
  return <Screen><QueryState pending={requests.isPending} error={requests.error}><Text style={styles.muted}>Preparando tu panel...</Text></QueryState></Screen>
}
