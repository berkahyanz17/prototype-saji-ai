import { View, Text, Pressable, ScrollView, StyleSheet } from '../../lib/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { nutritionOf } from '../../lib/ingredients';
import { formatRp } from '../../lib/prefs';
import { getRecipe, matchRecipe } from '../../lib/recipes';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, favorites, toggleFavorite, recipes } = useFridge();
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

  const { items, readyCount, total } = matchRecipe(
    recipe,
    fridge.map((i) => i.name)
  );
  const n = nutritionOf(recipe);
  const isFav = favorites.includes(recipe.id);
  const missing = items.filter((i) => !i.ready).map((i) => i.ingredient.name);

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
          <Text style={styles.topTitle}>Resep</Text>
          <View style={styles.actions}>
            {recipe.custom && (
              <Pressable
                style={styles.roundButton}
                onPress={() =>
                  router.push({ pathname: '/recipe-editor', params: { id: recipe.id } })
                }
                hitSlop={10}
              >
                <Ionicons name="create-outline" size={22} color="#462b0e" />
              </Pressable>
            )}
            <Pressable
              style={styles.roundButton}
              onPress={() => toggleFavorite(recipe.id)}
              hitSlop={10}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color="#462b0e"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{recipe.name}</Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/nutrition/[id]', params: { id: recipe.id } })
            }
          >
            <Text style={styles.link}>detail nutrisi</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={22} color="#20392e" />
            <Text style={styles.statText}>{recipe.minutes} mnt</Text>
          </View>
          <Text style={styles.statText}>{n.unavailable ? '– kkal' : `${n.calories} kkal`}</Text>
          <Text style={styles.statText}>
            {n.unavailable ? '– protein' : `${n.protein} g protein`}
          </Text>
        </View>

        {recipe.cost ? (
          <Text style={styles.cost}>
            Perkiraan biaya ± Rp{formatRp(recipe.cost)} per porsi
          </Text>
        ) : null}

        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.section}>Bahan yang dibutuhkan</Text>
            <Text style={styles.sub}>
              Kamu punya {readyCount} dari {total} bahan
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{recipe.servings} porsi</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {items.map(({ ingredient, ready }) => (
            <View key={ingredient.name} style={styles.ing}>
              <View style={[styles.mark, ready ? styles.markReady : styles.markMissing]}>
                <Ionicons
                  name={ready ? 'checkmark' : 'add'}
                  size={16}
                  color={ready ? '#20392e' : '#b4541a'}
                />
              </View>
              <View style={styles.ingText}>
                <Text style={styles.ingName}>{ingredient.name}</Text>
                <Text style={styles.ingAmount}>{ingredient.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {missing.length > 0 && (
          <Text style={styles.missing}>Bahan yang kurang: {missing.join(', ')}</Text>
        )}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.cookButton}
          onPress={() =>
            router.push({ pathname: '/cook/[id]', params: { id: recipe.id } })
          }
        >
          <Text style={styles.cookText}>Ayo masak</Text>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topTitle: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  actions: { flexDirection: 'row', gap: 8 },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbefc8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 150,
    borderRadius: 20,
    backgroundColor: '#f1dc9a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 84 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },
  name: { flex: 1, fontSize: 26, fontWeight: '700', color: '#462b0e' },
  link: { fontSize: 12, color: '#462b0ecc', marginBottom: 4 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#d4e8a2',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, fontWeight: '500', color: '#20392e' },
  cost: { fontSize: 12, color: '#605c5a', marginTop: -10, marginBottom: 14 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  section: { fontSize: 20, fontWeight: '700', color: '#462b0e' },
  sub: { fontSize: 12, color: '#605c5a', marginTop: 2 },
  pill: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: { fontSize: 12, color: '#20392e' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  ing: { width: '50%', flexDirection: 'row', alignItems: 'center' },
  mark: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  markReady: { backgroundColor: '#d4e8a2' },
  markMissing: { backgroundColor: '#fbe3d2' },
  ingText: { flex: 1 },
  ingName: { fontSize: 14, fontWeight: '600', color: '#462b0e' },
  ingAmount: { fontSize: 11, color: '#605c5a' },
  missing: { fontSize: 13, color: '#b4541a', marginTop: 16 },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  cookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#462b0e',
    borderRadius: 18,
    paddingVertical: 16,
    gap: 8,
  },
  cookText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});