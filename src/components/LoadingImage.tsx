import { useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View, type ImageProps } from 'react-native'
import { colors } from './UI'

export function LoadingImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false)

  return <View style={[styles.wrapper, props.style]}>
    {!loaded && <View style={styles.loader}>
      <ActivityIndicator color={colors.brand} />
    </View>}
    <Image
      {...props}
      style={[StyleSheet.absoluteFill, props.style]}
      onLoad={(event) => props.onLoad?.(event)}
      onLoadEnd={() => {
        setLoaded(true)
        props.onLoadEnd?.()
      }}
    />
  </View>
}

const styles = StyleSheet.create({
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
