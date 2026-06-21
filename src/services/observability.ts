import * as Sentry from '@sentry/react-native'

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN

export function initializeObservability() {
  Sentry.init({
    dsn,
    enabled: Boolean(dsn) && !__DEV__,
    environment: process.env.EXPO_PUBLIC_APP_ENVIRONMENT || (__DEV__ ? 'development' : 'production'),
    release: process.env.EXPO_PUBLIC_APP_RELEASE || 'tecngo-mobile@1.0.0',
    tracesSampleRate: Number(process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.1),
    sendDefaultPii: false,
  })
}

export function setObservedUser(userId?: string, role?: string) {
  Sentry.setUser(userId ? { id: userId } : null)
  Sentry.setTag('role', role || 'anonymous')
}

export function captureClientError(error: unknown, correlationId?: string) {
  Sentry.withScope((scope) => {
    if (correlationId) scope.setTag('correlationId', correlationId)
    Sentry.captureException(error)
  })
}

export { Sentry }
