import { useState } from 'react'
import { Pressable, StyleSheet, Text, View, type TextInputProps } from 'react-native'
import { Field, colors } from './UI'

export function SecureField(props: TextInputProps) {
  const [visible, setVisible] = useState(false)
  return <View style={styles.container}>
    <Field
      {...props}
      autoCapitalize={props.autoCapitalize ?? 'none'}
      autoCorrect={props.autoCorrect ?? false}
      secureTextEntry={!visible}
      selectionColor={colors.brand}
      cursorColor={colors.brand}
      style={[styles.field, props.style]}
    />
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onPress={() => setVisible((value) => !value)}
      style={styles.toggle}
    >
      <Text style={styles.toggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
    </Pressable>
  </View>
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  field: { paddingRight: 84, color: '#f8fafc', backgroundColor: '#0f172a', opacity: 1 },
  toggle: { position: 'absolute', right: 14, top: 15, paddingHorizontal: 4 },
  toggleText: { color: colors.brand, fontWeight: '700' },
})
