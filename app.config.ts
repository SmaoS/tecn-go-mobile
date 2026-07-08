import type { ConfigContext } from 'expo/config'
import { existsSync } from 'node:fs'

export default ({ config }: ConfigContext) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON
  const universalLinkHosts = (process.env.EXPO_PUBLIC_UNIVERSAL_LINK_HOSTS || 'tecn-go.com,www.tecn-go.com')
    .split(',')
    .map((host: string) => host.trim())
    .filter(Boolean)
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
      associatedDomains: [
        ...new Set([
          ...(config.ios?.associatedDomains ?? []),
          ...universalLinkHosts.map((host: string) => `applinks:${host}`),
        ]),
      ],
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      ...config.android,
      ...(googleServicesFile && existsSync(googleServicesFile) ? { googleServicesFile } : {}),
      intentFilters: [
        ...(config.android?.intentFilters ?? []),
        ...universalLinkHosts.flatMap((host: string) => [
          {
            action: 'VIEW',
            autoVerify: true,
            data: [{ scheme: 'https', host, pathPrefix: '/app' }],
            category: ['BROWSABLE', 'DEFAULT'],
          },
          {
            action: 'VIEW',
            autoVerify: true,
            data: [{ scheme: 'https', host, pathPrefix: '/reset-password' }],
            category: ['BROWSABLE', 'DEFAULT'],
          },
          {
            action: 'VIEW',
            autoVerify: true,
            data: [{ scheme: 'https', host, pathPrefix: '/verificar-correo' }],
            category: ['BROWSABLE', 'DEFAULT'],
          },
          {
            action: 'VIEW',
            autoVerify: true,
            data: [{ scheme: 'https', host, pathPrefix: '/abrir-app' }],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ]),
      ],
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
