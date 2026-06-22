import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, colors, Field } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import { RoutePreviewMap } from '../../../components/RoutePreviewMap'
import type { ServiceRequest } from '../../../types'
import { formatCopCurrency, formatElapsedTime } from '../../../shared/format'
import { apiMessage, hasApiStatus } from '../../../shared/apiMessage'
import { useLiveCurrentLocation } from '../../location/hooks'
import { useSendQuote } from '../hooks'
import { showToast } from '../../../components/Toast'

export function AvailableRequestDetailModal({ request, onClose }: {
  request: ServiceRequest | null
  onClose: () => void
}) {
  const [price, setPrice] = useState('')
  const [comment, setComment] = useState('')
  const [largeImage, setLargeImage] = useState<string | null>(null)
  const scroll = useRef<ScrollView>(null)
  const quote = useSendQuote()
  const location = useLiveCurrentLocation(Boolean(request))
  useEffect(() => {
    setPrice('')
    setComment('')
    quote.reset()
  }, [request?.id])
  if (!request) return null
  const current = request
  const destination = Number.isFinite(request.latitude) && Number.isFinite(request.longitude)
    ? { latitude: request.latitude, longitude: request.longitude }
    : undefined
  const pendingMessage = quote.error && hasApiStatus(quote.error, 409)
    ? 'Ya tienes una cotización pendiente para este servicio.'
    : quote.error ? apiMessage(quote.error) : ''
  function send(value: number, description?: string) {
    if (!Number.isFinite(value) || value <= 0) return
    quote.mutate({ id: current.id, price: value, description }, {
      onSuccess: () => {
        showToast('Cotización enviada correctamente')
        onClose()
      },
    })
  }
  function openRoute() {
    if (!location.coordinates || !destination) return
    const origin = `${location.coordinates.latitude},${location.coordinates.longitude}`
    const target = `${destination.latitude},${destination.longitude}`
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target}&travelmode=driving`)
  }
  const formattedPrice = price ? formatCopCurrency(Number(price)) : ''
  return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <Text style={styles.mapTitle}>Recorrido aproximado</Text>
        <Text style={styles.mapText}>Consulta tu ubicación en tiempo real y el sector aproximado del servicio antes de cotizar. La dirección exacta se habilita cuando el cliente acepta.</Text>
        <RoutePreviewMap origin={location.coordinates} destination={destination} distanceKm={request.distanceKm} />
        {location.error && <Text style={styles.error}>{location.error}</Text>}
        {location.coordinates && destination && <Pressable onPress={openRoute} style={styles.routeButton}>
          <Text style={styles.routeButtonText}>Abrir ruta vial en Google Maps</Text>
        </Pressable>}
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
        <Text style={styles.sectionTitle}>Descripción del servicio</Text>
        <Text style={styles.description}>{request.description}</Text>
        <Text style={styles.sectionTitle}>Imágenes del servicio</Text>
        {request.images?.length
          ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {request.images.map((image) => <Pressable key={image.id} onPress={() => setLargeImage(image.imageUrl)}>
              <PrivateImage url={image.imageUrl} style={styles.thumbnail} />
            </Pressable>)}
          </ScrollView>
          : <Text style={styles.empty}>Sin imágenes adjuntas</Text>}
        {request.estimatedPrice != null && <Button
          title={`Aceptar oferta por ${formatCopCurrency(request.estimatedPrice)}`}
          loading={quote.isPending}
          onPress={() => send(request.estimatedPrice!, 'Acepto el valor estimado por el cliente')}
        />}
        <Text style={styles.sectionTitle}>Enviar tu oferta</Text>
        <Field
          testID="e2e.quote.price"
          keyboardType="numeric"
          placeholder="Valor de la cotización"
          value={formattedPrice}
          onFocus={() => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 250)}
          onChangeText={(value) => setPrice(value.replace(/\D/g, ''))}
        />
        <Field
          testID="e2e.quote.comment"
          multiline
          placeholder="Comentario para el cliente"
          value={comment}
          onFocus={() => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 250)}
          onChangeText={setComment}
        />
        {pendingMessage && <Text style={styles.error}>{pendingMessage}</Text>}
        <Button testID="e2e.quote.submit" title="Enviar cotización" loading={quote.isPending} onPress={() => send(Number(price), comment || undefined)} />
        <Pressable disabled={quote.isPending} onPress={onClose} style={styles.close}><Text style={styles.closeText}>Cerrar</Text></Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    <Modal visible={Boolean(largeImage)} transparent animationType="fade" onRequestClose={() => setLargeImage(null)}>
      <Pressable style={styles.viewer} onPress={() => setLargeImage(null)}>
        {largeImage && <PrivateImage url={largeImage} resizeMode="contain" style={styles.largeImage} />}
      </Pressable>
    </Modal>
  </Modal>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  mapTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  mapText: { color: colors.muted, marginBottom: 14, lineHeight: 18 },
  routeButton: { alignItems: 'center', borderColor: colors.brand, borderRadius: 14, borderWidth: 1, marginTop: 12, paddingVertical: 12 },
  routeButtonText: { color: colors.brand, fontWeight: '900' },
  summary: { flexDirection: 'row', paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  avatar: { width: 62, height: 62, borderRadius: 31 },
  fallback: { backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.brand, fontSize: 24, fontWeight: '900' },
  summaryText: { flex: 1, marginLeft: 14 },
  name: { color: colors.text, fontSize: 18, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  price: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 8 },
  address: { color: '#DCE6F3', marginTop: 5 },
  category: { color: colors.brand, fontWeight: '800', marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 22, marginBottom: 8 },
  description: { color: '#DCE6F3', lineHeight: 21 },
  empty: { color: '#94a3b8' },
  thumbnail: { width: 118, height: 90, borderRadius: 12, marginRight: 10 },
  error: { color: '#be123c', marginVertical: 8 },
  close: { alignItems: 'center', padding: 16, marginTop: 8 },
  closeText: { color: colors.muted, fontWeight: '800' },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,.92)', alignItems: 'center', justifyContent: 'center' },
  largeImage: { width: '94%', height: '80%' },
})
