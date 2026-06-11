import type { ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext) => ({
  ...config,
  name: config.name ?? 'TecnGo',
  slug: config.slug ?? 'tecngo',
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
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
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
})
