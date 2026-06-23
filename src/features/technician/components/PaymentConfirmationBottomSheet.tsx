import { StyleSheet, Text, View } from 'react-native'
import { AppBottomSheet, SheetPrimaryButton, SheetSecondaryButton, SheetTextButton } from '../../../components/AppBottomSheet'
import { colors } from '../../../components/UI'
import { formatCopCurrency } from '../../../shared/format'
import type { ServiceRequest } from '../../../types'
import { paymentMethodLabels } from '../../payments/paymentMethods'

export function PaymentConfirmationBottomSheet({
  visible,
  request,
  loading,
  onPaid,
  onUnpaid,
  onClose,
}: {
  visible: boolean
  request?: ServiceRequest
  loading?: boolean
  onPaid: () => void
  onUnpaid: () => void
  onClose: () => void
}) {
  const amount = request?.finalPrice ?? request?.technicianPrice ?? request?.estimatedPrice
  return <AppBottomSheet
    visible={visible}
    title="✓ Servicio finalizado"
    message="¿Confirma si el cliente ya te pagó?"
    onClose={onClose}
  >
    <View style={local.summary}>
      <Info label="Cliente" value={request?.clientName ?? 'Cliente'} />
      <Info label="Método de pago" value={paymentMethodLabels[request?.requestedPaymentMethod ?? ''] ?? request?.requestedPaymentMethod ?? 'No definido'} />
      <Info label="Valor acordado" value={formatCopCurrency(amount)} highlight />
    </View>
    <SheetPrimaryButton title="Sí, recibí el pago" loading={loading} onPress={onPaid} />
    <SheetSecondaryButton title="No recibí el pago" danger disabled={loading} onPress={onUnpaid} />
    <SheetTextButton title="Cancelar" onPress={onClose} />
  </AppBottomSheet>
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <View style={local.row}>
    <Text style={local.label}>{label}</Text>
    <Text style={[local.value, highlight && local.highlight]}>{value}</Text>
  </View>
}

const local = StyleSheet.create({
  summary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: '#020817',
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 7,
  },
  label: {
    color: colors.muted,
    fontWeight: '700',
    flex: 1,
  },
  value: {
    color: colors.text,
    fontWeight: '900',
    flex: 1,
    textAlign: 'right',
  },
  highlight: {
    color: colors.brand,
  },
})
