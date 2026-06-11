import { useState } from 'react'
import { Image, Pressable, ScrollView, Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Card, Field, styles, colors } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useCreateRequest, useServiceCategories } from '../hooks'
import { useServiceImagePicker } from '../../files/hooks'
import { useCurrentLocation } from '../../location/hooks'

export function CreateRequestScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'RequestService'>) {
  const categories = useServiceCategories()
  const [form, setForm] = useState({ categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '' })
  const [images, setImages] = useState<{ uri: string; name: string; mimeType: string }[]>([])
  const location = useCurrentLocation()
  const picker = useServiceImagePicker()
  const create = useCreateRequest(() => navigation.replace('Home'))
  async function useGps() {
    const coordinates = await location.getCurrent()
    if (coordinates) setForm({ ...form, latitude: String(coordinates.latitude), longitude: String(coordinates.longitude) })
  }
  return <KeyboardAwareScreen><Text style={styles.title}>Nuevo servicio</Text><Text style={styles.label}>Categoría</Text>
    <QueryState pending={categories.isPending} error={categories.error}>
      <>{categories.data?.map((item) => <Pressable key={item.id} onPress={() => setForm({ ...form, categoryId: item.id })}><Card><Text style={[styles.cardTitle, form.categoryId === item.id && { color: colors.brand }]}>{item.name}</Text><Text style={styles.muted}>{item.description}</Text></Card></Pressable>)}</>
    </QueryState>
    <Field multiline placeholder="Describe el problema" value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
    <Field placeholder="Dirección" value={form.address} onChangeText={(address) => setForm({ ...form, address })} />
    <Field keyboardType="numeric" placeholder="Latitud" value={form.latitude} onChangeText={(latitude) => setForm({ ...form, latitude })} />
    <Field keyboardType="numeric" placeholder="Longitud" value={form.longitude} onChangeText={(longitude) => setForm({ ...form, longitude })} />
    <Button title="Usar ubicación GPS" onPress={useGps} loading={location.isLocating} />
    <Field keyboardType="numeric" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChangeText={(estimatedPrice) => setForm({ ...form, estimatedPrice })} />
    <Button title={images.length ? `${images.length} imágenes seleccionadas` : 'Subir imágenes opcionales'} onPress={() => picker.mutate(5, { onSuccess: setImages })} loading={picker.isPending} />
    {images.length > 0 && <ScrollView horizontal>{images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} style={{ width: 100, height: 100, borderRadius: 12, marginRight: 8 }} />)}</ScrollView>}
    {(location.error || picker.error || create.error) && <Text style={styles.error}>{location.error || apiMessage(picker.error ?? create.error)}</Text>}
    <Button title="Crear solicitud" onPress={() => create.mutate({ payload: {
      ...form, latitude: Number(form.latitude), longitude: Number(form.longitude),
      estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
    }, images })} loading={create.isPending} />
  </KeyboardAwareScreen>
}
