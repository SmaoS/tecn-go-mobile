import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PrivateImage } from '../../../components/PrivateImage'
import type { ServiceRequest } from '../../../types'
import { formatCopCurrency, formatElapsedTime } from '../../../shared/format'
import { paymentMethodLabels } from '../../payments/paymentMethods'
import { colors } from '../../../components/UI'

export function AvailableRequestItem({ request, onPress }: { request: ServiceRequest; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.item}>
    <View style={styles.client}>
      {request.clientProfilePhotoUrl
        ? <PrivateImage url={request.clientProfilePhotoUrl} style={styles.avatar} />
        : <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.initial}>{request.clientName.charAt(0)}</Text></View>}
      <Text numberOfLines={1} style={styles.clientName}>{request.clientName}</Text>
      <Text style={styles.meta}>★ {request.clientAverageRating.toFixed(1)}</Text>
      <Text style={styles.meta}>{request.clientPaidServicesCount} pagados</Text>
      <Text style={styles.elapsed}>{formatElapsedTime(request.createdAt)}</Text>
    </View>
    <View style={styles.main}>
      <View style={styles.topLine}>
        <Text style={styles.distance}>~{request.distanceKm?.toLocaleString('es-CO', { maximumFractionDigits: 1 }) ?? '?'} km</Text>
        <Text style={styles.more}>···</Text>
      </View>
      <Text style={styles.price}>{formatCopCurrency(request.estimatedPrice)}</Text>
      <Text numberOfLines={1} style={styles.address}>{request.address}</Text>
      <Text numberOfLines={1} style={styles.category}>{request.categoryName}</Text>
      <Text numberOfLines={1} style={styles.payment}>Pago: {paymentMethodLabels[request.requestedPaymentMethod] ?? request.requestedPaymentMethod}</Text>
      {request.firstServiceImageUrl && <View style={styles.imageWrap}>
        <PrivateImage url={request.firstServiceImageUrl} style={styles.thumbnail} />
        {request.serviceImagesCount > 1 && <Text style={styles.imageCount}>+{request.serviceImagesCount - 1}</Text>}
      </View>}
    </View>
  </Pressable>
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingVertical: 16, paddingHorizontal: 14 },
  client: { width: 104, alignItems: 'center', paddingRight: 12, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.brand },
  avatarFallback: { backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.brand, fontSize: 20, fontWeight: '900' },
  clientName: { color: colors.text, fontWeight: '800', marginTop: 6, maxWidth: 96 },
  meta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  elapsed: { color: colors.brand, fontSize: 11, fontWeight: '800', marginTop: 5 },
  main: { flex: 1, paddingLeft: 14, minHeight: 124 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between' },
  distance: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  more: { color: '#94a3b8', fontSize: 20, lineHeight: 14 },
  price: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 5 },
  address: { color: '#DCE6F3', fontSize: 13, marginTop: 4 },
  category: { color: colors.brand, fontSize: 12, fontWeight: '800', marginTop: 5 },
  payment: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  imageWrap: { position: 'absolute', right: 0, bottom: 0 },
  thumbnail: { width: 54, height: 42, borderRadius: 8 },
  imageCount: { position: 'absolute', right: 3, bottom: 3, color: '#fff', backgroundColor: 'rgba(15,23,42,.75)', borderRadius: 8, paddingHorizontal: 5, fontSize: 10, fontWeight: '800' },
})
