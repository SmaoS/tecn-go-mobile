import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button, Field } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import type { ServiceRequest } from '../../../types'
import { formatCopCurrency, formatElapsedTime } from '../../../shared/format'
import { apiMessage, hasApiStatus } from '../../../shared/apiMessage'
import { useSendQuote } from '../hooks'

export function AvailableRequestDetailModal({ request, radiusKm, onClose }: {
  request: ServiceRequest | null
  radiusKm: string
  onClose: () => void
}) {
  const [price, setPrice] = useState('')
  const [comment, setComment] = useState('')
  const [largeImage, setLargeImage] = useState<string | null>(null)
  const quote = useSendQuote(radiusKm)
  if (!request) return null
  const current = request
  const pendingMessage = quote.error && hasApiStatus(quote.error, 409)
    ? 'Ya tienes una cotización pendiente para este servicio.'
    : quote.error ? apiMessage(quote.error) : ''
  function send(value: number, description?: string) {
    if (!Number.isFinite(value) || value <= 0) return
    quote.mutate({ id: current.id, price: value, description }, { onSuccess: onClose })
  }
  return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.map}>
          <Text style={styles.mapTitle}>Recorrido aproximado</Text>
          <Text style={styles.mapText}>El mapa detallado estará disponible cuando el cliente acepte una cotización.</Text>
          <Text style={styles.mapDistance}>~{request.distanceKm?.toLocaleString('es-CO', { maximumFractionDigits: 1 }) ?? '?'} km</Text>
        </View>
        <View style={styles.summary}>
          {request.clientProfilePhotoUrl
            ? <PrivateImage url={request.clientProfilePhotoUrl} style={styles.avatar} />
            : <View style={[styles.avatar, styles.fallback]}><Text style={styles.initial}>{request.clientName.charAt(0)}</Text></View>}
          <View style={styles.summaryText}>
            <Text style={styles.name}>{request.clientName}</Text>
            <Text style={styles.meta}>★ {request.clientAverageRating.toFixed(1)} · {request.clientPaidServicesCount} pagados · {formatElapsedTime(request.createdAt)}</Text>
            <Text style={styles.price}>{formatCopCurrency(request.estimatedPrice)}</Text>
            <Text style={styles.address}>{request.address}</Text>
            <Text style={styles.category}>{request.categoryName}</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{request.description}</Text>
        <Text style={styles.sectionTitle}>Imágenes</Text>
        {request.images?.length
          ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {request.images.map((image) => <Pressable key={image.id} onPress={() => setLargeImage(image.imageUrl)}>
              <PrivateImage url={image.imageUrl} style={styles.thumbnail} />
            </Pressable>)}
          </ScrollView>
          : <Text style={styles.empty}>Sin imágenes adjuntas</Text>}
        {request.estimatedPrice != null && <Button
          title={`Aceptar por ${formatCopCurrency(request.estimatedPrice)}`}
          loading={quote.isPending}
          onPress={() => send(request.estimatedPrice!, 'Acepto el valor estimado por el cliente')}
        />}
        <Text style={styles.sectionTitle}>Enviar tu oferta</Text>
        <Field keyboardType="numeric" placeholder="Valor de la cotización" value={price} onChangeText={setPrice} />
        <Field multiline placeholder="Comentario para el cliente" value={comment} onChangeText={setComment} />
        {pendingMessage && <Text style={styles.error}>{pendingMessage}</Text>}
        <Button title="Enviar cotización" loading={quote.isPending} onPress={() => send(Number(price), comment || undefined)} />
        <Pressable disabled={quote.isPending} onPress={onClose} style={styles.close}><Text style={styles.closeText}>Cerrar</Text></Pressable>
      </ScrollView>
    </View>
    <Modal visible={Boolean(largeImage)} transparent animationType="fade" onRequestClose={() => setLargeImage(null)}>
      <Pressable style={styles.viewer} onPress={() => setLargeImage(null)}>
        {largeImage && <PrivateImage url={largeImage} resizeMode="contain" style={styles.largeImage} />}
      </Pressable>
    </Modal>
  </Modal>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 18, paddingBottom: 40 },
  map: { minHeight: 180, borderRadius: 18, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', padding: 24 },
  mapTitle: { color: '#0f172a', fontSize: 20, fontWeight: '900' },
  mapText: { color: '#475569', textAlign: 'center', marginTop: 8 },
  mapDistance: { color: '#0891b2', fontSize: 24, fontWeight: '900', marginTop: 12 },
  summary: { flexDirection: 'row', paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  avatar: { width: 62, height: 62, borderRadius: 31 },
  fallback: { backgroundColor: '#cffafe', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#0e7490', fontSize: 24, fontWeight: '900' },
  summaryText: { flex: 1, marginLeft: 14 },
  name: { color: '#0f172a', fontSize: 18, fontWeight: '900' },
  meta: { color: '#64748b', fontSize: 12, marginTop: 4 },
  price: { color: '#0f172a', fontSize: 26, fontWeight: '900', marginTop: 8 },
  address: { color: '#334155', marginTop: 5 },
  category: { color: '#0891b2', fontWeight: '800', marginTop: 4 },
  sectionTitle: { color: '#0f172a', fontSize: 17, fontWeight: '900', marginTop: 22, marginBottom: 8 },
  description: { color: '#334155', lineHeight: 21 },
  empty: { color: '#94a3b8' },
  thumbnail: { width: 118, height: 90, borderRadius: 12, marginRight: 10 },
  error: { color: '#be123c', marginVertical: 8 },
  close: { alignItems: 'center', padding: 16, marginTop: 8 },
  closeText: { color: '#475569', fontWeight: '800' },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,.92)', alignItems: 'center', justifyContent: 'center' },
  largeImage: { width: '94%', height: '80%' },
})
