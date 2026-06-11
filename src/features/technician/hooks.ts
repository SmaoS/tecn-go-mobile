import { useQuery } from '@tanstack/react-query'
import { technicianApi } from './api'

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
