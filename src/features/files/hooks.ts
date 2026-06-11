import { useMutation } from '@tanstack/react-query'
import {
  pickAndUploadEvidence,
  pickAndUploadImage,
  pickServiceImages,
  uploadServiceImage,
} from '../../services/files'

export const useProfileImageUpload = () => useMutation({ mutationFn: pickAndUploadImage })
export const useDocumentUpload = () => useMutation({
  mutationFn: (kind: 'DOCUMENT' | 'CERTIFICATE' = 'DOCUMENT') => pickAndUploadEvidence(kind),
})
export const useServiceImagePicker = () => useMutation({
  mutationFn: (max: number) => pickServiceImages(max),
})
export const useServiceImageUpload = () => useMutation({
  mutationFn: ({ requestId, asset }: {
    requestId: string
    asset: { uri: string; name: string; mimeType: string }
  }) => uploadServiceImage(requestId, asset),
})
