import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles, colors } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useCreateRequest, useServiceCategories } from '../hooks'
import { useServiceImagePicker } from '../../files/hooks'
import { reverseGeocodeCoordinates, useCurrentLocation } from '../../location/hooks'
import { LocationPickerModal } from '../../location/LocationPickerModal'
import { useProfile } from '../../profile/hooks'
import { paymentMethodLabels, requestPaymentMethods, type RequestPaymentMethod } from '../../payments/paymentMethods'
import { formatCopCurrency } from '../../../shared/format'
import { FloatingFormFooter } from '../../../components/FloatingFormFooter'
import { ActionSheet } from '../../../components/ActionSheet'

export function CreateRequestScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RequestService'>) {
  const categories = useServiceCategories()
  const [form, setForm] = useState<{ categoryId: string; description: string; address: string; latitude: string; longitude: string; estimatedPrice: string; paymentMethod: RequestPaymentMethod | '' }>({ categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '', paymentMethod: '' })
  const [images, setImages] = useState<{ uri: string; name: string; mimeType: string }[]>([])
  const [mapVisible, setMapVisible] = useState(false)
  const [imageSheetVisible, setImageSheetVisible] = useState(false)
  const location = useCurrentLocation()
  const picker = useServiceImagePicker()
  const create = useCreateRequest(() => navigation.replace('Home'))
  const profile = useProfile()
  const selectedCategory = categories.data?.find((item) => item.id === form.categoryId)
  const selectedPaymentMethod = form.paymentMethod || null
  const selectedCoordinates = form.latitude && form.longitude
    ? { latitude: Number(form.latitude), longitude: Number(form.longitude) }
    : null
  async function useGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) setForm((value) => ({
      ...value,
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      address: coordinates.address || value.address || profile.data?.homeAddress || '',
    }))
  }
  useEffect(() => { void useGps() }, [])
  function imageSourceOptions() {
    const remaining = Math.max(1, 5 - images.length)
    return [
      { label: 'Tomar foto con cámara', onPress: () => picker.mutate({ source: 'camera', max: 1 }, { onSuccess: (items) => setImages([...images, ...items].slice(0, 5)) }) },
      { label: 'Seleccionar de galería', onPress: () => picker.mutate({ source: 'gallery', max: remaining }, { onSuccess: (items) => setImages([...images, ...items].slice(0, 5)) }) },
    ]
  }
  const submitDisabled = !form.categoryId || !form.description.trim()
    || !form.address.trim() || !form.latitude || !form.longitude || !form.paymentMethod
  function submit() {
    if (!profile.data?.cityId || !form.latitude || !form.longitude || !form.paymentMethod) return
    create.mutate({ payload: {
      ...form, cityId: profile.data.cityId, latitude: Number(form.latitude), longitude: Number(form.longitude),
      estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
    }, images })
  }
  return <KeyboardAwareScreen footer={<FloatingFormFooter testID="e2e.request.submit" title="Crear solicitud" onPress={submit} loading={create.isPending} disabled={submitDisabled} />}><Text style={styles.label}>Categoría *</Text>
    <QueryState pending={categories.isPending} error={categories.error}>
      <>{selectedCategory
        ? <Card><Text style={[styles.cardTitle, { color: colors.brand }]}>{selectedCategory.name}</Text><Text style={styles.muted}>{selectedCategory.description}</Text><Button title="Ver categorías" onPress={() => setForm({ ...form, categoryId: '' })} /></Card>
        : categories.data?.map((item) => <Pressable key={item.id} onPress={() => setForm({ ...form, categoryId: item.id })}><Card><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.description}</Text></Card></Pressable>)}</>
    </QueryState>
    <Text style={styles.label}>Describe el problema *</Text>
    <Field testID="e2e.request.description" multiline placeholder="Describe el problema" value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
    <Button title={images.length ? `Sube foto del problema (${images.length}/5)` : 'Sube foto del problema'} onPress={() => setImageSheetVisible(true)} loading={picker.isPending} />
    {images.length > 0 && <ScrollView horizontal>{images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} style={{ width: 100, height: 100, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    <Field testID="e2e.request.estimatedPrice" keyboardType="numeric" placeholder="Presupuesto estimado (opcional)"
      value={form.estimatedPrice ? formatCopCurrency(Number(form.estimatedPrice)) : ''}
      onChangeText={(estimatedPrice) => setForm({ ...form, estimatedPrice: estimatedPrice.replace(/\D/g, '') })} />
    <Text style={styles.label}>¿Por dónde vas a pagar? *</Text>
    {selectedPaymentMethod
      ? <Card><Text style={[styles.cardTitle, { color: colors.brand }]}>{paymentMethodLabels[selectedPaymentMethod]}</Text>
        <Button title="Cambiar medio de pago" onPress={() => setForm({ ...form, paymentMethod: '' })} />
      </Card>
      : requestPaymentMethods.map((method) => <Pressable key={method} onPress={() => setForm({ ...form, paymentMethod: method })}>
        <Card><Text style={styles.cardTitle}>{paymentMethodLabels[method]}</Text></Card>
      </Pressable>)}
    <Button title="Elegir otra ubicación en mapa" onPress={() => setMapVisible(true)} />
    <Text style={styles.label}>Dirección del servicio *</Text>
    <Field testID="e2e.request.address" placeholder={location.isLocating ? 'Obteniendo dirección...' : 'Dirección del servicio'}
      value={form.address} onChangeText={(address) => setForm({ ...form, address })} />
    {(location.error || picker.error || create.error) && <Text style={styles.error}>{location.error || apiMessage(picker.error ?? create.error)}</Text>}
    {!profile.data?.cityId ? <Text style={styles.error}>Completa la ciudad en Mi perfil antes de crear una solicitud.</Text> : null}
    {!form.latitude || !form.longitude ? <Text style={styles.error}>Se requiere ubicación GPS para publicar la solicitud.</Text> : null}
    <LocationPickerModal
      visible={mapVisible}
      value={selectedCoordinates}
      onSelect={(coordinates) => {
        setForm((value) => ({ ...value, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude) }))
        void reverseGeocodeCoordinates(coordinates).then((address) => {
          if (address) setForm((value) => ({ ...value, address }))
        }).catch(() => undefined)
      }}
      onClose={() => setMapVisible(false)}
    />
    <ActionSheet
      visible={imageSheetVisible}
      title="Agregar foto"
      message="Elige cómo quieres subir la foto del problema."
      options={imageSourceOptions()}
      onClose={() => setImageSheetVisible(false)}
    />
  </KeyboardAwareScreen>
}
