import type { ReactNode } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from './UI'

type Props = {
  children: ReactNode
  footer?: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  keyboardVerticalOffset?: number
}

export function KeyboardAwareScreen({
  children,
  footer,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0,
}: Props) {
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={[styles.content, footer ? styles.contentWithFooter : undefined, contentContainerStyle]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
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
    paddingBottom: 48,
  },
  contentWithFooter: {
    paddingBottom: 120,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(2, 8, 23, 0.96)',
  },
})
