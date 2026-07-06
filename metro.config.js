const { getDefaultConfig } = require('expo/metro-config')
const { withSentryConfig } = require('@sentry/react-native/metro')

const config = getDefaultConfig(__dirname)
const uploadSourcemaps = process.env.SENTRY_UPLOAD_SOURCEMAPS === 'true'

module.exports = uploadSourcemaps ? withSentryConfig(config) : config
