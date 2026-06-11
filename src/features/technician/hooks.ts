import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { technicianApi } from './api'
import type { TechnicianProfileForm } from './types'
import { requestKeys } from '../service-requests/hooks'

export const technicianProfileKey = ['technicians', 'me'] as const
export const categoriesKey = ['service-categories'] as const

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
