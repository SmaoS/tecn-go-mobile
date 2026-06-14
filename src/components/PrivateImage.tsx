import { Image, type ImageProps } from 'react-native'
import { api } from '../api/client'
import { useSession } from '../context/useSession'

function resolveUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url
  return `${api.defaults.baseURL}${url}`
}

export function PrivateImage({ url, ...props }: Omit<ImageProps, 'source'> & { url: string }) {
  const { session } = useSession()
  return <Image
    {...props}
    source={{
      uri: resolveUrl(url),
      headers: session ? { Authorization: `Bearer ${session.token}` } : undefined,
    }}
  />
}
