const { getDefaultConfig } = require('expo/metro-config')
const { withSentryConfig } = require('@sentry/react-native/metro')

module.exports = withSentryConfig(getDefaultConfig(__dirname))
