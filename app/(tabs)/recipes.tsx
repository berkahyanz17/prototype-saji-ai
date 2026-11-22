import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from '../../lib/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { rankRecipes } from '../../lib/recipes';
import { generateRecipes } from '../../lib/api';
import RecipeCard from '../../lib/RecipeCard';

const FILTERS = ['All', 'Rekomendasi', 'Favorit', 'Mudah dan cepat'];

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, favorites, recipes, setAiRecipes, prefs } = useFridge();
  const { q: qParam } = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortFast, setSortFast] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (typeof qParam === 'string') setQuery(qParam);
  }, [qParam]);

  const makeAiRecipes = async () => {
    if (fridge.length === 0) {
      Alert.alert('Lemari masih kosong', 'Scan atau tambahkan bahan dulu.');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateRecipes(
        fridge.map((i) => i.name),
        prefs
      );
      if (result.length === 0) {
        Alert.alert('Belum ada hasil', 'AI tidak menghasilkan resep. Coba lagi.');
      } else {
        setAiRecipes(result);
        setFilter('All');
        Alert.alert('Resep AI siap', `${result.length} resep dibuat dari bahan di lemarimu.`);
      }
    } catch (e) {
      Alert.alert(
        'Gagal membuat resep',
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      setGenerating(false);
    }
  };

  const q = query.trim().toLowerCase();
  let list = rankRecipes(
    fridge.map((i) => i.name),
    recipes
  ).filter(({ recipe, readyCount, total }) => {
    if (!recipe.name.toLowerCase().includes(q)) return false;
    if (filter === 'Rekomendasi') return readyCount / total >= 0.6;
    if (filter === 'Favorit') return favorites.includes(recipe.id);
    if (filter === 'Mudah dan cepat') return recipe.minutes <= 10;
    return true;
  });
  if (sortFast) list = [...list].sort((a, b) => a.recipe.minutes - b.recipe.minutes);

  return (
    <View style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Resep masakan</Text>
        <Text style={styles.subtitle}>bahan yang lo punya</Text>

        <Pressable
          style={[styles.aiButton, generating && styles.aiDisabled]}
          onPress={makeAiRecipes}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="sparkles" size={20} color="#fff" />
          )}
          <Text style={styles.aiText}>
            {generating ? 'Membuat resep...' : 'Buat resep dari lemariku'}
          </Text>
        </Pressable>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={22} color="#2f4a2a" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Cari resep..."
              placeholderTextColor="#7b8466"
            />
          </View>
          <Pressable
            style={[styles.filterButton, sortFast && styles.filterActive]}
            onPress={() => setSortFast((v) => !v)}
          >
            <Ionicons name="options-outline" size={24} color="#2f4a2a" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((name) => (
            <Pressable
              key={name}
              style={[styles.chip, filter === name && styles.chipActive]}
              onPress={() => setFilter(name)}
            >
              <Text style={[styles.chipText, filter === name && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Rekomendasi menu</Text>
          {sortFast && <Text style={styles.sortHint}>urut: tercepat</Text>}
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={list}
        keyExtractor={(item) => item.recipe.id}
        ListEmptyComponent={<Text style={styles.empty}>Tidak ada resep yang cocok.</Text>}
        renderItem={({ item, index }) => (
          <RecipeCard
            recipe={item.recipe}
            readyCount={item.readyCount}
            total={item.total}
            label={
              index === 0
                ? 'Rekomendasi terbaik'
                : item.recipe.id.startsWith('ai-')
                  ? 'Dibuat AI'
                  : item.recipe.minutes <= 10
                    ? 'Mudah dan cepat'
                    : 'Resep masakan'
            }
            onPress={() =>
              router.push({ pathname: '/recipe/[id]', params: { id: item.recipe.id } })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  top: { paddingHorizontal: 16 },
  title: { fontSize: 36, fontWeight: '700', color: '#3b2412' },
  subtitle: { fontSize: 14, color: '#7a6a58', marginBottom: 12 },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#20392e',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  aiDisabled: { opacity: 0.7 },
  aiText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef0d4',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#2b2118' },
  filterButton: {
    width: 62,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#eef0d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: '#d3da9c' },
  chipScroll: { flexGrow: 0, marginBottom: 16 },
  chipRow: { gap: 8 },
  chip: {
    backgroundColor: '#e7e7e7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipActive: { backgroundColor: '#8f9a6a' },
  chipText: { fontSize: 14, color: '#444', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  section: { fontSize: 20, fontWeight: '700', color: '#3b2412' },
  sortHint: { fontSize: 12, color: '#7a6a58' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  empty: { textAlign: 'center', color: '#8a7a68', marginTop: 24 },
});