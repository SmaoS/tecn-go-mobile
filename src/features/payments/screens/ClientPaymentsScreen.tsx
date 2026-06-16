import { Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useClientRequestHistory } from '../../service-requests/hooks'

export function ClientPaymentsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ClientPayments'>) {
  const history = useClientRequestHistory()
  const paid = (history.data ?? []).filter((item) => item.status === 'PAID')
  return <KeyboardAwareScreen>
    <Text style={styles.title}>Pagos</Text>
    <Text style={styles.subtitle}>Servicios pagados desde tu cuenta.</Text>
    <QueryState pending={history.isPending} error={history.error} empty={paid.length === 0} emptyText="Aún no tienes pagos registrados.">
      <View style={{ gap: 10 }}>
        {paid.map((item) => <Pressable key={item.id} onPress={() => navigation.navigate('RequestDetail', { request: item })}>
          <Card>
            <Text style={styles.cardTitle}>{item.categoryName}</Text>
            <Text style={styles.muted}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={[styles.cardTitle, { color: colors.brand }]}>{item.finalPrice != null ? `$${item.finalPrice.toLocaleString()}` : 'Pago registrado'}</Text>
          </Card>
        </Pressable>)}
      </View>
    </QueryState>
  </KeyboardAwareScreen>
}
