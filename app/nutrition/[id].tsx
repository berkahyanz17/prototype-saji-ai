import { View, Text, Pressable, ScrollView, StyleSheet } from '../../lib/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { nutritionOf } from '../../lib/ingredients';
import { getRecipe } from '../../lib/recipes';

export default function NutritionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes } = useFridge();
  const recipe = getRecipe(String(id), recipes);
  const n = recipe ? nutritionOf(recipe) : null;

  // Targets are general daily reference values for a 2000 kcal diet
  const rows = n
    ? [
        { label: 'Protein', value: n.protein, target: 60, unit: 'g' },
        { label: 'Karbohidrat', value: n.carbs, target: 300, unit: 'g' },
        { label: 'Lemak', value: n.fat, target: 65, unit: 'g' },
        { label: 'Gula', value: n.sugar, target: 50, unit: 'g' },
        { label: 'Natrium', value: n.sodium, target: 2000, unit: 'mg' },
        { label: 'Serat', value: n.fiber, target: 30, unit: 'g' },
      ]
    : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={34} color="#462b0e" />
          </Pressable>
          <Text style={styles.title}>Detail Nutrisi</Text>
        </View>

        {!recipe || !n ? (
          <Text style={styles.recipeName}>Resep tidak ditemukan</Text>
        ) : (
          <>
            <View style={styles.headRow}>
              <View style={styles.thumb}>
                <Text style={styles.thumbEmoji}>{recipe.emoji}</Text>
              </View>
              <Text style={styles.recipeName}>{recipe.name}</Text>
            </View>

            <View style={styles.summary}>
              {[
                { label: 'Kalori', value: n.calories, unit: 'kkal' },
                { label: 'Protein', value: n.protein, unit: 'g' },
                { label: 'Karbohidrat', value: n.carbs, unit: 'g' },
                { label: 'Lemak', value: n.fat, unit: 'g' },
              ].map((cell, index) => (
                <View key={cell.label} style={[styles.cell, index > 0 && styles.cellDivider]}>
                  <Text style={styles.cellLabel}>{cell.label}</Text>
                  <Text style={styles.cellValue}>{cell.value}</Text>
                  <Text style={styles.cellValue}>{cell.unit}</Text>
                </View>
              ))}
            </View>

            {rows.map((row) => {
              const percent = Math.round((row.value / row.target) * 100);
              return (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
                  </View>
                  <Text style={styles.rowValue}>
                    {row.value} {row.unit}
                  </Text>
                  <Text style={styles.rowPercent}>{percent} % AKG</Text>
                </View>
              );
            })}

            <Text style={styles.note}>
              {n.fromDb
                ? `Dihitung dari database bahan (${n.matched} dari ${n.total} bahan cocok).`
                : `Perkiraan AI (database hanya cocok ${n.matched} dari ${n.total} bahan).`}{' '}
              Per porsi; AKG memakai acuan harian umum (diet 2000 kkal). Hanya perkiraan, bukan
              saran medis.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  headRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  thumb: {
    width: 100,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#f1dc9a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 48 },
  recipeName: { flex: 1, fontSize: 20, fontWeight: '700', color: '#462b0e' },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#fbefc8',
    borderRadius: 20,
    paddingVertical: 12,
    marginBottom: 14,
  },
  cell: { flex: 1, alignItems: 'center' },
  cellDivider: { borderLeftWidth: 1.5, borderLeftColor: '#462b0e' },
  cellLabel: { fontSize: 12, fontWeight: '600', color: '#462b0e', marginBottom: 4 },
  cellValue: { fontSize: 13, color: '#1e1e1e' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefc8',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  rowLabel: { width: 84, fontSize: 14, fontWeight: '700', color: '#462b0e', textAlign: 'center' },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  fill: { height: 10, backgroundColor: '#a9cf6a' },
  rowValue: { width: 56, fontSize: 12, fontWeight: '500', color: '#1e1e1e', textAlign: 'right' },
  rowPercent: { width: 62, fontSize: 12, color: '#1e1e1e' },
  note: { fontSize: 12, color: '#605c5a', textAlign: 'center', marginTop: 6, lineHeight: 18 },
});