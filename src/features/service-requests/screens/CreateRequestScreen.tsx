import { useEffect, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles, colors } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useCreateRequest, useServiceCategories } from '../hooks'
import { useServiceImagePicker } from '../../files/hooks'
import { useCurrentLocation } from '../../location/hooks'
import { LocationPickerModal } from '../../location/LocationPickerModal'
import { useProfile } from '../../profile/hooks'
import { paymentMethodLabels, requestPaymentMethods, type RequestPaymentMethod } from '../../payments/paymentMethods'

export function CreateRequestScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RequestService'>) {
  const categories = useServiceCategories()
  const [form, setForm] = useState<{ categoryId: string; description: string; address: string; latitude: string; longitude: string; estimatedPrice: string; paymentMethod: RequestPaymentMethod }>({ categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '', paymentMethod: 'CASH' })
  const [images, setImages] = useState<{ uri: string; name: string; mimeType: string }[]>([])
  const [mapVisible, setMapVisible] = useState(false)
  const location = useCurrentLocation()
  const picker = useServiceImagePicker()
  const create = useCreateRequest(() => navigation.replace('Home'))
  const profile = useProfile()
  const selectedCategory = categories.data?.find((item) => item.id === form.categoryId)
  const selectedCoordinates = form.latitude && form.longitude
    ? { latitude: Number(form.latitude), longitude: Number(form.longitude) }
    : null
  async function useGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) setForm((value) => ({ ...value, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude) }))
  }
  useEffect(() => { void useGps() }, [])
  function chooseImageSource() {
    const remaining = Math.max(1, 5 - images.length)
    Alert.alert('Agregar foto', 'Elige el origen de la imagen.', [
      { text: 'Cámara', onPress: () => picker.mutate({ source: 'camera', max: 1 }, { onSuccess: (items) => setImages([...images, ...items].slice(0, 5)) }) },
      { text: 'Galería', onPress: () => picker.mutate({ source: 'gallery', max: remaining }, { onSuccess: (items) => setImages([...images, ...items].slice(0, 5)) }) },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }
  return <KeyboardAwareScreen><Text style={styles.title}>Nuevo servicio</Text><Text style={styles.label}>Categoría</Text>
    <QueryState pending={categories.isPending} error={categories.error}>
      <>{selectedCategory
        ? <Card><Text style={[styles.cardTitle, { color: colors.brand }]}>{selectedCategory.name}</Text><Text style={styles.muted}>{selectedCategory.description}</Text><Button title="Ver categorías" onPress={() => setForm({ ...form, categoryId: '' })} /></Card>
        : categories.data?.map((item) => <Pressable key={item.id} onPress={() => setForm({ ...form, categoryId: item.id })}><Card><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.description}</Text></Card></Pressable>)}</>
    </QueryState>
    <Card>
      <Text style={styles.cardTitle}>Ciudad del servicio</Text>
      <Text style={styles.muted}>{profile.data?.cityName ?? profile.data?.homeCity ?? 'No configurada en tu perfil'}</Text>
      <Text style={styles.muted}>Se toma automáticamente de tu perfil. Puedes cambiar dirección y ubicación exacta para este servicio.</Text>
    </Card>
    <Field multiline placeholder="Describe el problema" value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
    <Field placeholder="Dirección" value={form.address} onChangeText={(address) => setForm({ ...form, address })} />
    <Text style={styles.label}>Ubicación del servicio</Text>
    <Text style={styles.muted}>Activa la ubicación para usar tu GPS o elige manualmente el punto en el mapa.</Text>
    <Button title={form.latitude && form.longitude ? 'Ubicación GPS lista' : 'Obtener ubicación GPS'} onPress={useGps} loading={location.isLocating} />
    <Button title="Elegir ubicación en mapa" onPress={() => setMapVisible(true)} />
    <Field keyboardType="numeric" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChangeText={(estimatedPrice) => setForm({ ...form, estimatedPrice })} />
    <Text style={styles.label}>¿Por dónde vas a pagar?</Text>
    {requestPaymentMethods.map((method) => <Pressable key={method} onPress={() => setForm({ ...form, paymentMethod: method })}>
      <Card style={form.paymentMethod === method ? { borderColor: colors.brand } : undefined}>
        <Text style={[styles.cardTitle, form.paymentMethod === method && { color: colors.brand }]}>{paymentMethodLabels[method]}</Text>
      </Card>
    </Pressable>)}
    <Button title={images.length ? `Agregar foto (${images.length}/5)` : 'Tomar foto o elegir de galería'} onPress={chooseImageSource} loading={picker.isPending} />
    {images.length > 0 && <ScrollView horizontal>{images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} style={{ width: 100, height: 100, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    {(location.error || picker.error || create.error) && <Text style={styles.error}>{location.error || apiMessage(picker.error ?? create.error)}</Text>}
    {!profile.data?.cityId ? <Text style={styles.error}>Completa la ciudad en Mi perfil antes de crear una solicitud.</Text> : null}
    {!form.latitude || !form.longitude ? <Text style={styles.error}>Se requiere ubicación GPS para publicar la solicitud.</Text> : null}
    <Button title="Crear solicitud" onPress={() => {
      if (!profile.data?.cityId || !form.latitude || !form.longitude) return
      create.mutate({ payload: {
      ...form, cityId: profile.data.cityId, latitude: Number(form.latitude), longitude: Number(form.longitude),
      estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
    }, images })
    }} loading={create.isPending} />
    <LocationPickerModal
      visible={mapVisible}
      value={selectedCoordinates}
      onSelect={(coordinates) => setForm((value) => ({ ...value, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude) }))}
      onClose={() => setMapVisible(false)}
    />
  </KeyboardAwareScreen>
}
