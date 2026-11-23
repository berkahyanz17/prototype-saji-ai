import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../../lib/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { formatQty, planCooking } from '../../lib/ingredients';
import { getRecipe, matchRecipe } from '../../lib/recipes';

const COLLAPSED_COUNT = 5;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, recipes, cookRecipe } = useFridge();
  const [showAll, setShowAll] = useState(false);
  const recipe = getRecipe(String(id), recipes);

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={34} color="#462b0e" />
        </Pressable>
        <Text style={styles.name}>Resep tidak ditemukan</Text>
      </View>
    );
  }

  const { items } = matchRecipe(
    recipe,
    fridge.map((i) => i.name)
  );
  const canCollapse = items.length > COLLAPSED_COUNT;
  const shown = canCollapse && !showAll ? items.slice(0, COLLAPSED_COUNT) : items;

  const finish = () => {
    const changes = planCooking(recipe, fridge);
    const lines = changes.slice(0, 8).map((c) => {
      const label = capitalize(c.name);
      if (c.after === null) return `• ${label}: habis`;
      return `• ${label}: ${formatQty(c.before)} → ${formatQty(c.after)} ${c.unit ?? ''}`.trim();
    });
    const extra = changes.length > 8 ? `\n…dan ${changes.length - 8} lainnya` : '';

    Alert.alert(
      'Selesai memasak?',
      lines.length > 0
        ? `Stok akan dikurangi:\n${lines.join('\n')}${extra}`
        : 'Streak masak hari ini akan dicatat.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Selesai',
          onPress: () => {
            cookRecipe(recipe.id, changes);
            router.navigate('/');
            Alert.alert('Selamat makan! 🍽️', 'Streak masak hari ini sudah tercatat.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={34} color="#462b0e" />
          </Pressable>
          <Text style={styles.title}>Langkah Memasak</Text>
        </View>

        <View style={styles.headRow}>
          <View style={styles.thumb}>
            <Text style={styles.thumbEmoji}>{recipe.emoji}</Text>
          </View>
          <Text style={styles.name}>{recipe.name}</Text>
        </View>

        <Text style={styles.section}>Bahan yang dibutuhkan</Text>
        <View style={styles.chips}>
          {shown.map(({ ingredient, ready }) => (
            <View key={ingredient.name} style={styles.chip}>
              <View style={[styles.mark, ready ? styles.markReady : styles.markMissing]}>
                <Ionicons
                  name={ready ? 'checkmark' : 'add'}
                  size={12}
                  color={ready ? '#20392e' : '#b4541a'}
                />
              </View>
              <View style={styles.chipText}>
                <Text style={styles.chipName} numberOfLines={1}>
                  {ingredient.name}
                </Text>
                <Text style={styles.chipAmount} numberOfLines={1}>
                  {ingredient.amount}
                </Text>
              </View>
            </View>
          ))}
          {canCollapse && (
            <Pressable style={[styles.chip, styles.chipMore]} onPress={() => setShowAll((v) => !v)}>
              <Text style={styles.chipMoreText}>{showAll ? 'Tutup' : 'Lihat semua'}</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.section, styles.stepsTitle]}>Langkah - Langkah</Text>
        {recipe.steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.finishButton} onPress={finish}>
          <Text style={styles.finishText}>Selesai memasak</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  headRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  thumb: {
    width: 100,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#f1dc9a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 48 },
  name: { flex: 1, fontSize: 20, fontWeight: '700', color: '#462b0e' },
  section: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefc8',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  chipMore: { justifyContent: 'center' },
  chipMoreText: { fontSize: 12, fontWeight: '600', color: '#462b0e' },
  mark: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  markReady: { backgroundColor: '#d4e8a2' },
  markMissing: { backgroundColor: '#fbe3d2' },
  chipText: { flex: 1 },
  chipName: { fontSize: 12, fontWeight: '600', color: '#462b0e' },
  chipAmount: { fontSize: 10, color: '#605c5a' },
  stepsTitle: { marginTop: 22 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefc8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#d4e8a2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { fontWeight: '700', color: '#20392e' },
  stepText: { flex: 1, fontSize: 14, color: '#1e1e1e', lineHeight: 20 },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  finishButton: {
    backgroundColor: '#462b0e',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});