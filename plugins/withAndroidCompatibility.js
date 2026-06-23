const {
  AndroidConfig,
  withAndroidManifest,
  withAndroidStyles,
  withGradleProperties,
} = require('@expo/config-plugins')

const BARCODE_SCANNER_ACTIVITY =
  'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity'

function withLargeScreenManifest(config) {
  return withAndroidManifest(config, (pluginConfig) => {
    const manifest = AndroidConfig.Manifest.ensureToolsAvailable(pluginConfig.modResults)
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest)
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifest)

    application.$['android:resizeableActivity'] = 'true'
    mainActivity.$['android:resizeableActivity'] = 'true'
    mainActivity.$['android:screenOrientation'] = 'unspecified'

    application.activity = application.activity ?? []
    const scannerActivity = application.activity.find(
      (activity) => activity.$?.['android:name'] === BARCODE_SCANNER_ACTIVITY,
    )
    const scannerOverride = scannerActivity ?? { $: { 'android:name': BARCODE_SCANNER_ACTIVITY } }

    scannerOverride.$['android:screenOrientation'] = 'unspecified'
    scannerOverride.$['android:resizeableActivity'] = 'true'
    scannerOverride.$['tools:replace'] = 'android:screenOrientation'

    if (!scannerActivity) {
      application.activity.push(scannerOverride)
    }

    pluginConfig.modResults = manifest
    return pluginConfig
  })
}

function withoutLegacySystemBarColors(config) {
  return withAndroidStyles(config, (pluginConfig) => {
    const styles = pluginConfig.modResults.resources.style ?? []
    const appTheme = styles.find((style) => style.$?.name === 'AppTheme')

    if (appTheme?.item) {
      appTheme.item = appTheme.item.filter(
        (item) =>
          item.$?.name !== 'android:statusBarColor'
          && item.$?.name !== 'android:navigationBarColor',
      )
    }

    return pluginConfig
  })
}

function withoutDeprecatedExpoEdgeToEdgeProperty(config) {
  return withGradleProperties(config, (pluginConfig) => {
    pluginConfig.modResults = pluginConfig.modResults.filter(
      (property) => property.key !== 'expo.edgeToEdgeEnabled',
    )
    return pluginConfig
  })
}

module.exports = function withAndroidCompatibility(config) {
  config = withLargeScreenManifest(config)
  config = withoutLegacySystemBarColors(config)
  return withoutDeprecatedExpoEdgeToEdgeProperty(config)
}
