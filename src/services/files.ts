import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { api } from '../api/client'

type UploadAsset = { uri: string; name: string; mimeType: string }

async function upload(asset: UploadAsset, kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE') {
  const body = new FormData()
  body.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType } as unknown as Blob)
  body.append('kind', kind)
  const { data } = await api.post<{ url: string }>('/v1/files/upload', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

export const uploadProfileAsset = (asset: UploadAsset) => upload(asset, 'PROFILE')
export const uploadAsset = (asset: UploadAsset, kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE') => upload(asset, kind)

export async function pickAndUploadImageAsset(kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE', source: 'camera' | 'gallery') {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) throw new Error(source === 'camera' ? 'Permiso de cámara denegado' : 'Permiso de galería denegado')
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.82 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.82 })
  if (result.canceled) return undefined
  const asset = result.assets[0]
  if (!asset) return undefined
  return upload({
    uri: asset.uri,
    name: asset.fileName ?? `${kind.toLowerCase()}-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  }, kind)
}

export async function pickServiceImages({ source, max = 5 }: { source: 'camera' | 'gallery'; max?: number }) {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) throw new Error(source === 'camera' ? 'Permiso de cámara denegado' : 'Permiso de galería denegado')
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: max,
      quality: 0.8,
    })
  if (result.canceled) return []
  return result.assets.slice(0, max).map((asset) => ({
    uri: asset.uri,
    name: asset.fileName ?? `service-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  }))
}

export async function uploadServiceImage(requestId: string, asset: UploadAsset) {
  const body = new FormData()
  body.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType } as unknown as Blob)
  await api.post(`/v1/service-requests/${requestId}/images`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function pickAndUploadImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) throw new Error('Permiso de galería denegado')
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  })
  if (result.canceled) return undefined
  const asset = result.assets[0]
  if (!asset) return undefined
  return upload({
    uri: asset.uri,
    name: asset.fileName ?? `photo-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  }, 'PROFILE')
}

export async function pickAndUploadEvidence(kind: 'DOCUMENT' | 'CERTIFICATE' = 'DOCUMENT') {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/jpeg', 'image/png', 'application/pdf'],
    copyToCacheDirectory: true,
  })
  if (result.canceled) return undefined
  const asset = result.assets[0]
  if (!asset) return undefined
  return upload({
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/pdf',
  }, kind)
}
