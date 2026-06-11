import { FlatList, Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Screen, colors, styles } from '../../../components/UI'
import { useUnreadNotifications } from '../../notifications/hooks'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useClientRequests } from '../hooks'

export function ClientHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const requests = useClientRequests()
  const unread = useUnreadNotifications()
  return <Screen><Text style={styles.title}>¿Qué necesitas?</Text><Text style={styles.subtitle}>Encuentra ayuda técnica confiable.</Text>
    <Button title="Solicitar servicio" onPress={() => navigation.navigate('RequestService')} />
    <View style={{ flexDirection: 'row', gap: 8, marginVertical: 16 }}>
      <Pressable onPress={() => navigation.navigate('NearbyTechnicians')}><Text style={styles.link}>Técnicos cercanos</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Profile')}><Text style={styles.link}>Mi perfil</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Notifications')}><Text style={styles.link}>Notificaciones{(unread.data ?? 0) > 0 ? ` (${unread.data})` : ''}</Text></Pressable>
    </View>
    <Text style={styles.label}>Solicitudes recientes</Text>
    <QueryState pending={requests.isPending} error={requests.error ?? unread.error} empty={requests.data?.length === 0} emptyText="Aún no tienes solicitudes.">
      <FlatList data={requests.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => navigation.navigate('RequestDetail', { request: item })}><Card><Text style={styles.cardTitle}>{item.categoryName}</Text><Text style={styles.muted}>{item.description}</Text><Text style={[styles.muted, { color: colors.brand }]}>{item.status}</Text></Card></Pressable>} />
    </QueryState>
  </Screen>
}
