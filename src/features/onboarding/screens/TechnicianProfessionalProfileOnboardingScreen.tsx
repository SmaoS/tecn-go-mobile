import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Field, colors, styles } from '../../../components/UI'
import { apiMessage } from '../../../shared/apiMessage'
import { useTechnicianCategories } from '../../technician/hooks'
import { onboardingApi } from '../api'

export function TechnicianProfessionalProfileOnboardingScreen({ onComplete }: {
  onComplete: () => Promise<unknown>
}) {
  const categories = useTechnicianCategories()
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const save = useMutation({
    mutationFn: onboardingApi.professionalProfile,
    onSuccess: () => onComplete(),
  })
  const valid = categoryIds.length > 0 && experience.trim().length >= 30

  return <Card>
    <Text style={styles.cardTitle}>Completa tu perfil técnico</Text>
    <Text style={styles.muted}>Cuéntale a los clientes qué servicios realizas, tu experiencia y especialidad.</Text>
    <Text style={screenStyles.label}>Categorías de servicios</Text>
    {categories.isPending && <Text style={styles.muted}>Cargando categorías...</Text>}
    {categories.error && <Text style={styles.error}>{apiMessage(categories.error)}</Text>}
    <View style={screenStyles.categories}>
      {categories.data?.map((category) => {
        const active = categoryIds.includes(category.id)
        return <Pressable
          key={category.id}
          style={[screenStyles.category, active && screenStyles.categoryActive]}
          onPress={() => setCategoryIds((current) => active
            ? current.filter((id) => id !== category.id)
            : [...current, category.id])}
        >
          <Text style={[screenStyles.categoryText, active && screenStyles.categoryTextActive]}>
            {active ? '✓ ' : ''}{category.name}
          </Text>
        </Pressable>
      })}
    </View>
    <Field
      multiline
      numberOfLines={6}
      maxLength={1000}
      placeholder="Describe tu experiencia"
      value={experience}
      onChangeText={setExperience}
      style={screenStyles.experience}
    />
    <Text style={styles.muted}>{experience.trim().length}/1000 · mínimo 30 caracteres</Text>
    {save.error && <Text style={styles.error}>{apiMessage(save.error)}</Text>}
    <Button
      title="Continuar"
      disabled={!valid || save.isPending}
      loading={save.isPending}
      onPress={() => save.mutate({
        categoryIds,
        workExperienceDescription: experience.trim(),
      })}
    />
  </Card>
}

const screenStyles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '800', marginBottom: 10, marginTop: 18 },
  categories: { gap: 8, marginBottom: 14 },
  category: { borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 12 },
  categoryActive: { backgroundColor: '#063A18', borderColor: colors.brand },
  categoryText: { color: colors.muted, fontWeight: '700' },
  categoryTextActive: { color: colors.brand },
  experience: { minHeight: 130, textAlignVertical: 'top' },
})
