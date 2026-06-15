import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { technicianApi } from './api'
import type { TechnicianProfileForm } from './types'
import { requestKeys } from '../service-requests/hooks'

export const technicianProfileKey = ['technicians', 'me'] as const
export const categoriesKey = ['service-categories'] as const
export const technicianAvailabilityKey = ['technicians', 'me', 'availability'] as const

export const useTechnicianProfile = () => useQuery({
  queryKey: technicianProfileKey,
  queryFn: technicianApi.profile,
  retry: false,
})
export const useTechnicianCategories = () => useQuery({
  queryKey: categoriesKey,
  queryFn: technicianApi.categories,
})

export function useSaveTechnicianProfile(exists: boolean) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (form: TechnicianProfileForm) => technicianApi.saveProfile(exists, {
      ...form,
      latitude: Number(form.latitude), longitude: Number(form.longitude),
      homeLatitude: Number(form.homeLatitude), homeLongitude: Number(form.homeLongitude),
    }),
    onSuccess: (data) => client.setQueryData(technicianProfileKey, data),
  })
}

export function useSendQuote(radiusKm: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, price, description }: { id: string; price: number; description?: string }) =>
      technicianApi.quote(id, price, description),
    onSuccess: () => client.invalidateQueries({ queryKey: requestKeys.available(radiusKm) }),
  })
}

export function useTechnicianReferrals() {
  const code = useQuery({ queryKey: ['referrals', 'code'], queryFn: technicianApi.referralCode })
  const referrals = useQuery({ queryKey: ['referrals', 'registrations'], queryFn: technicianApi.referrals })
  const rewards = useQuery({ queryKey: ['referrals', 'rewards'], queryFn: technicianApi.referralRewards })
  return { code, referrals, rewards }
}

export function useTechnicianAvailability() {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: technicianAvailabilityKey,
    queryFn: technicianApi.availability,
  })
  const update = useMutation({
    mutationFn: technicianApi.setAvailability,
    onSuccess: (data) => {
      client.setQueryData(technicianAvailabilityKey, data)
      void client.invalidateQueries({ queryKey: requestKeys.available('10') })
    },
  })
  return { ...query, update }
}
