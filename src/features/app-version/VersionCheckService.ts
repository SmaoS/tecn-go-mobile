import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { AppState, Linking, Platform } from 'react-native'
import { api } from '../../api/client'
import type { AppVersionCheck } from '../../types'

export const LAST_VERSION_CHECK_AT_KEY = 'tecngo.appVersion.lastCheckAt'
export const LAST_RECOMMENDED_VERSION_SHOWN_AT_KEY = 'tecngo.appVersion.lastRecommendedShownAt'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const RECOMMENDED_INTERVAL_MS = 24 * 60 * 60 * 1000

export function getCurrentAppVersion() {
  const constants = Constants as typeof Constants & { nativeAppVersion?: string }
  return constants.nativeAppVersion ?? Constants.expoConfig?.version ?? '1.0.0'
}

export async function shouldCheckVersion() {
  const enforceVersionCheck = process.env.EXPO_PUBLIC_ENFORCE_VERSION_CHECK !== 'false'
  if (!enforceVersionCheck || Platform.OS !== 'android' && Platform.OS !== 'ios') return false
  const lastCheckAt = Number(await AsyncStorage.getItem(LAST_VERSION_CHECK_AT_KEY))
  return !Number.isFinite(lastCheckAt) || Date.now() - lastCheckAt >= CHECK_INTERVAL_MS
}

export async function checkAppVersion(options: { ignoreThrottle?: boolean } = {}) {
  if (!options.ignoreThrottle && !await shouldCheckVersion()) return undefined
  const enforceVersionCheck = process.env.EXPO_PUBLIC_ENFORCE_VERSION_CHECK !== 'false'
  if (!enforceVersionCheck || Platform.OS !== 'android' && Platform.OS !== 'ios') return undefined

  const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID'
  const currentVersion = getCurrentAppVersion()
  try {
    const { data } = await api.get<AppVersionCheck>('/v1/app-version/check', {
      params: { platform, currentVersion },
    })
    await AsyncStorage.setItem(LAST_VERSION_CHECK_AT_KEY, String(Date.now()))
    if (!data.updateRequired) return undefined
    if (data.forceUpdate) return data
    const lastRecommendedShownAt = Number(await AsyncStorage.getItem(LAST_RECOMMENDED_VERSION_SHOWN_AT_KEY))
    if (Number.isFinite(lastRecommendedShownAt)
        && Date.now() - lastRecommendedShownAt < RECOMMENDED_INTERVAL_MS) {
      return undefined
    }
    await AsyncStorage.setItem(LAST_RECOMMENDED_VERSION_SHOWN_AT_KEY, String(Date.now()))
    return data
  } catch (reason) {
    console.warn('App version check failed; continuing normally.', reason)
    return undefined
  }
}

export function openStore(check?: Pick<AppVersionCheck, 'updateUrl'>) {
  if (!check?.updateUrl) return Promise.resolve(false)
  return Linking.openURL(check.updateUrl)
}
