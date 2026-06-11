import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '../../types'
import { profileApi } from './api'

export const profileKey = ['users', 'me', 'profile'] as const

export const useProfile = () => useQuery({ queryKey: profileKey, queryFn: profileApi.me })

export function useSaveProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (profile: UserProfile) => profileApi.save(profile),
    onSuccess: (profile) => client.setQueryData(profileKey, profile),
  })
}
