import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '../../types'
import { profileApi } from './api'
import { uploadProfileAsset } from '../../services/files'

export const profileKey = ['users', 'me', 'profile'] as const

export const useProfile = () => useQuery({ queryKey: profileKey, queryFn: profileApi.me })

export function useSaveProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (profile: UserProfile) => profileApi.save(profile),
    onSuccess: (profile) => client.setQueryData(profileKey, profile),
  })
}

export const useVerifyEmail = () => useMutation({ mutationFn: profileApi.verifyEmail })
export const useChangePassword = () => useMutation({ mutationFn: profileApi.changePassword })

export function useCaptureProfilePhoto(onSuccess: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (uri: string) => {
      const profile = await profileApi.me()
      const url = await uploadProfileAsset({
        uri,
        name: `profile-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      })
      return profileApi.save({ ...profile, profilePhotoUrl: url, profilePhotoFaceValidated: false })
    },
    onSuccess: (profile) => {
      client.setQueryData(profileKey, profile)
      onSuccess()
    },
  })
}
