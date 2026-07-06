import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from './UI'

type Props = {
  children: ReactNode
  footer?: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  keyboardVerticalOffset?: number
  scrollRef?: RefObject<ScrollView | null>
}

export function KeyboardAwareScreen({
  children,
  footer,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0,
  scrollRef,
}: Props) {
  const insets = useSafeAreaInsets()
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const footerBottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 28 : 14)
    + (keyboardVisible && Platform.OS === 'android' ? 8 : 0)
  const contentBottomPadding = footer ? 118 + footerBottomPadding : 48 + Math.max(insets.bottom, 0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true))
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false))
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }, contentContainerStyle]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>{footer}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(2, 8, 23, 0.96)',
  },
})
