process.env.EXPO_PUBLIC_API_URL ??= 'https://api.test.tecngo.local/api'
process.env.EXPO_PUBLIC_APP_ENVIRONMENT ??= 'test'

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  init: jest.fn(),
  setUser: jest.fn(),
  wrap: <T,>(component: T) => component,
}))

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  isAvailableAsync: jest.fn(async () => true),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3, High: 4, Highest: 6 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: {
      latitude: 4.142,
      longitude: -73.626,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  watchPositionAsync: jest.fn(async () => ({ remove: jest.fn() })),
  hasServicesEnabledAsync: jest.fn(async () => true),
}))

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5 },
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getDevicePushTokenAsync: jest.fn(async () => ({ type: 'fcm', data: 'test-fcm-token' })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}))

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}))

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}))

jest.mock('expo-camera', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    CameraView: React.forwardRef((props: object, ref: unknown) =>
      React.createElement(View, { ...props, ref })),
    useCameraPermissions: jest.fn(() => [
      { granted: true },
      jest.fn(async () => ({ granted: true })),
    ]),
  }
})

jest.mock('react-native-maps', () => {
  const React = require('react')
  const { View } = require('react-native')
  const MapComponent = (props: object) => React.createElement(View, props)
  return {
    __esModule: true,
    default: MapComponent,
    Marker: MapComponent,
    Polyline: MapComponent,
    PROVIDER_GOOGLE: 'google',
  }
})
