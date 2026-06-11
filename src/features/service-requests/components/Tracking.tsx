import { View } from 'react-native'
import { colors } from '../../../components/UI'
import type { RequestStatus } from '../../../types'

const steps: RequestStatus[] = [
  'QUOTE_PENDING', 'QUOTED', 'QUOTE_ACCEPTED', 'ON_THE_WAY',
  'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID',
]

export function Tracking({ status }: { status: RequestStatus }) {
  if (status === 'CANCELLED') return null
  const current = steps.indexOf(status)
  return <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16 }}>
    {steps.map((step, index) => <View key={step} style={{
      flex: 1, height: 7, borderRadius: 4,
      backgroundColor: index <= current ? colors.brand : colors.border,
    }} />)}
  </View>
}
