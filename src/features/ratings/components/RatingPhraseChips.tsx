import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, styles } from '../../../components/UI'
import { phrasesForAudience, type RatingAudience } from '../ratingPhrases'

export function RatingPhraseChips({
  audience,
  selected,
  onChange,
}: {
  audience: RatingAudience
  selected: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    onChange(selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value])
  }

  return <View style={local.container}>
    <Text style={styles.label}>Frases rápidas</Text>
    <View style={local.chips}>
      {phrasesForAudience(audience).map((phrase) => {
        const active = selected.includes(phrase.text)
        return <Pressable
          key={phrase.text}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          onPress={() => toggle(phrase.text)}
          style={[local.chip, active && local.chipActive]}
        >
          <Text style={[local.chipText, active && local.chipTextActive]}>
            {active ? '✓ ' : ''}{phrase.text}
          </Text>
        </Pressable>
      })}
    </View>
  </View>
}

const local = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: '#0B1220',
  },
  chipActive: {
    borderColor: colors.brand,
    backgroundColor: '#063A18',
  },
  chipText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.brand,
  },
})
