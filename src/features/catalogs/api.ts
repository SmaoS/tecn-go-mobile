import { api } from '../../api/client'
import type { CatalogItem } from '../../types'

export const geographicCatalogApi = {
  countries: () => api.get<CatalogItem[]>('/v1/catalogs/countries').then(({ data }) => data),
  departments: (countryId: string) =>
    api.get<CatalogItem[]>('/v1/catalogs/departments', { params: { countryId } }).then(({ data }) => data),
  cities: (departmentId: string) =>
    api.get<CatalogItem[]>('/v1/catalogs/cities', { params: { departmentId } }).then(({ data }) => data),
}
