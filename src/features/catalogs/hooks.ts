import { useQuery } from '@tanstack/react-query'
import { geographicCatalogApi } from './api'

export const geographicKeys = {
  countries: ['geographic-catalogs', 'countries'] as const,
  departments: (countryId: string) => ['geographic-catalogs', 'departments', countryId] as const,
  cities: (departmentId: string) => ['geographic-catalogs', 'cities', departmentId] as const,
}

export const useCountries = () => useQuery({
  queryKey: geographicKeys.countries,
  queryFn: geographicCatalogApi.countries,
})

export const useDepartments = (countryId?: string) => useQuery({
  queryKey: geographicKeys.departments(countryId ?? ''),
  queryFn: () => geographicCatalogApi.departments(countryId!),
  enabled: Boolean(countryId),
})

export const useCities = (departmentId?: string) => useQuery({
  queryKey: geographicKeys.cities(departmentId ?? ''),
  queryFn: () => geographicCatalogApi.cities(departmentId!),
  enabled: Boolean(departmentId),
})
