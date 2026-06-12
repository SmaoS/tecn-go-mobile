import type { ConfigContext } from 'expo/config'
import { existsSync } from 'node:fs'

export default ({ config }: ConfigContext) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON
  return {
    ...config,
    name: config.name ?? 'TecnGo',
    slug: config.slug ?? 'tecngo',
    owner: 'tecngo',
    android: {
      ...config.android,
      ...(googleServicesFile && existsSync(googleServicesFile) ? { googleServicesFile } : {}),
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      ...config.extra,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '3bef945c-fdbb-41c1-9990-4a399e8b1ddb',
      },
    },
  }
}
