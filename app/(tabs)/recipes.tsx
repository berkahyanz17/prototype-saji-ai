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
import { matchRecipe, rankRecipes } from '../../lib/recipes';
import { generateRecipes } from '../../lib/api';
import RecipeCard from '../../lib/RecipeCard';
import AdCard from '../../lib/AdCard';
import { CreditPill } from '../../lib/CreditPill';
import { openPaywall } from '../../lib/PaywallHost';

const FILTERS = ['All', 'Rekomendasi', 'Favorit', 'Mudah dan cepat', 'Resepku'];

type Ranked = ReturnType<typeof rankRecipes>[number];
type Row = { kind: 'recipe'; item: Ranked } | { kind: 'ad'; key: string };

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    fridge,
    favorites,
    recipes,
    userRecipes,
    setAiRecipes,
    prefs,
    isPlus,
    canSpend,
    spendCredit,
  } = useFridge();
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
    if (!canSpend()) {
      openPaywall();
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
        spendCredit();
        setAiRecipes(result);
        setFilter('All');
        Alert.alert('Resep AI siap', `${result.length} resep dibuat dari bahan di lemarimu.`);
      }
    } catch (e) {
      Alert.alert('Gagal membuat resep', e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const names = fridge.map((i) => i.name);
  const q = query.trim().toLowerCase();

  let list: Ranked[];
  if (filter === 'Resepku') {
    list = userRecipes
      .filter((r) => r.name.toLowerCase().includes(q))
      .map((recipe) => ({ recipe, ...matchRecipe(recipe, names) }));
  } else {
    list = rankRecipes(names, recipes).filter(({ recipe, readyCount, total }) => {
      if (!recipe.name.toLowerCase().includes(q)) return false;
      if (filter === 'Rekomendasi') return readyCount / total >= 0.6;
      if (filter === 'Favorit') return favorites.includes(recipe.id);
      if (filter === 'Mudah dan cepat') return recipe.minutes <= 10;
      return true;
    });
  }
  if (sortFast) list = [...list].sort((a, b) => a.recipe.minutes - b.recipe.minutes);

  const rows: Row[] = list.map((item) => ({ kind: 'recipe', item }));
  if (!isPlus && filter !== 'Resepku' && rows.length > 3) {
    rows.splice(3, 0, { kind: 'ad', key: 'ad' });
  }

  const labelFor = (r: Ranked, index: number) => {
    if (r.recipe.draft) return 'Draf';
    if (r.recipe.custom) return 'Resepku';
    if (index === 0) return 'Rekomendasi terbaik';
    if (r.recipe.id.startsWith('ai-')) return 'Dibuat AI';
    return r.recipe.minutes <= 10 ? 'Mudah dan cepat' : 'Resep masakan';
  };

  const open = (r: Ranked) =>
    r.recipe.draft
      ? router.push({ pathname: '/recipe-editor', params: { id: r.recipe.id } })
      : router.push({ pathname: '/recipe/[id]', params: { id: r.recipe.id } });

  return (
    <View style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Resep masakan</Text>
        <View style={styles.subRow}>
          <Text style={styles.subtitle}>bahan yang lo punya</Text>
          <CreditPill />
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.aiButton, generating && styles.aiDisabled]}
            onPress={makeAiRecipes}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="sparkles" size={18} color="#fff" />
            )}
            <Text style={styles.aiText}>{generating ? 'Membuat...' : 'Resep AI'}</Text>
          </Pressable>
          <Pressable style={styles.createButton} onPress={() => router.push('/recipe-editor')}>
            <Ionicons name="create-outline" size={18} color="#462b0e" />
            <Text style={styles.createText}>Buat resep</Text>
          </Pressable>
        </View>

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
                {name === 'Resepku' ? `Resepku ${userRecipes.length}` : name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>
            {filter === 'Resepku' ? 'Resepku' : 'Rekomendasi menu'}
          </Text>
          {sortFast && <Text style={styles.sortHint}>urut: tercepat</Text>}
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={rows}
        keyExtractor={(row) => (row.kind === 'ad' ? row.key : row.item.recipe.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {filter === 'Resepku'
              ? 'Belum ada resepmu. Ketuk Buat resep untuk mulai.'
              : 'Tidak ada resep yang cocok.'}
          </Text>
        }
        renderItem={({ item: row, index }) =>
          row.kind === 'ad' ? (
            <AdCard />
          ) : (
            <RecipeCard
              recipe={row.item.recipe}
              readyCount={row.item.readyCount}
              total={row.item.total}
              label={labelFor(row.item, index)}
              onPress={() => open(row.item)}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  top: { paddingHorizontal: 16 },
  title: { fontSize: 36, fontWeight: '700', color: '#3b2412' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subtitle: { fontSize: 14, color: '#7a6a58' },
  buttons: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#20392e',
    borderRadius: 14,
    paddingVertical: 12,
  },
  aiDisabled: { opacity: 0.7 },
  aiText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 12,
  },
  createText: { color: '#462b0e', fontWeight: '600', fontSize: 15 },
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