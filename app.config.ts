import type { ConfigContext } from 'expo/config'
import { existsSync } from 'node:fs'

export default ({ config }: ConfigContext) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON
  const sentryUploadEnabled = process.env.SENTRY_UPLOAD_SOURCEMAPS === 'true'
  const sentryConfigured = Boolean(
    process.env.SENTRY_AUTH_TOKEN
    && process.env.SENTRY_ORG
    && process.env.SENTRY_PROJECT,
  )
  if (sentryUploadEnabled && !sentryConfigured) {
    throw new Error(
      'SENTRY_UPLOAD_SOURCEMAPS=true requires SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT',
    )
  }
  const basePlugins = (config.plugins ?? []).filter((plugin) =>
    (Array.isArray(plugin) ? plugin[0] : plugin) !== '@sentry/react-native')
  return {
    ...config,
    name: config.name ?? 'TecnGo',
    slug: config.slug ?? 'tecngo',
    owner: 'tecngo',
    plugins: [
      ...basePlugins,
      ...(sentryUploadEnabled ? ['@sentry/react-native'] : []),
    ],
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
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
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    },
  }
}
