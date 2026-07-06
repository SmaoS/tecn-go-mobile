import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View, type ImageProps } from 'react-native'
import { File, Paths } from 'expo-file-system'
import { api } from '../api/client'
import { useSession } from '../context/useSession'
import { colors } from './UI'

function resolveUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url
  return `${api.defaults.baseURL}${url}`
}

function cacheKey(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index) | 0
  }
  return Math.abs(hash).toString(36)
}

export function PrivateImage({ url, ...props }: Omit<ImageProps, 'source'> & { url: string }) {
  const { session } = useSession()
  const [localUri, setLocalUri] = useState<string>()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    let active = true
    setImageLoaded(false)

    async function load() {
      if (!url) {
        setLocalUri(undefined)
        return
      }
      if (/^https?:\/\//.test(url)) {
        setLocalUri(url)
        return
      }
      if (!session?.token) {
        setLocalUri(undefined)
        return
      }

      const extension = url.includes('.png') ? 'png' : 'jpg'
      const target = new File(Paths.cache, `tecngo-private-${cacheKey(url)}.${extension}`)
      if (target.exists) {
        if (active) setLocalUri(target.uri)
        return
      }

      try {
        const downloaded = await File.downloadFileAsync(resolveUrl(url), target, {
          headers: { Authorization: `Bearer ${session.token}` },
          idempotent: true,
        })
        if (active) setLocalUri(downloaded.uri)
      } catch {
        if (active) setLocalUri(undefined)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [session?.token, url])

  if (!localUri) return null
  return <View style={[privateImageStyles.wrapper, props.style]}>
    {!imageLoaded && <View style={privateImageStyles.loader}>
      <ActivityIndicator color={colors.brand} />
    </View>}
    <Image
      {...props}
      source={{ uri: localUri }}
      style={[StyleSheet.absoluteFill, props.style]}
      onLoad={(event) => {
        props.onLoad?.(event)
      }}
      onLoadEnd={() => {
        setImageLoaded(true)
        props.onLoadEnd?.()
      }}
    />
  </View>
}

const privateImageStyles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
})
