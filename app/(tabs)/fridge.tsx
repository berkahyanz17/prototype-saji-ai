import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
} from '../../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge, type FridgeItem } from '../../lib/FridgeContext';
import { emojiFor, expiryStatus, type Tone } from '../../lib/foodInfo';

const TONE_COLORS: Record<Tone, string> = {
  urgent: '#b4541a',
  fresh: '#1f6f2e',
  far: '#3b2412',
  expired: '#b91c1c',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function FridgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, removeFromFridge } = useFridge();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortSoon, setSortSoon] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    fridge.forEach((i) => counts.set(i.category, (counts.get(i.category) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [fridge]);

  const active =
    category === 'All' || categories.some(([c]) => c === category) ? category : 'All';

  const q = query.trim().toLowerCase();
  const visible = fridge.filter(
    (i) => (active === 'All' || i.category === active) && i.name.includes(q)
  );
  if (sortSoon) visible.sort((a, b) => a.expiresAt - b.expiresAt);

  const openMenu = (item: FridgeItem) =>
    Alert.alert(capitalize(item.name), undefined, [
      { text: 'Hapus', style: 'destructive', onPress: () => removeFromFridge(item.id) },
      { text: 'Batal', style: 'cancel' },
    ]);

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = expiryStatus(item.expiresAt);
    return (
      <View style={styles.card}>
        <View style={styles.thumb}>
          <Text style={styles.emoji}>{emojiFor(item.name, item.category)}</Text>
        </View>
        <View style={styles.cardMain}>
          <Text style={styles.name} numberOfLines={1}>
            {capitalize(item.name)}
          </Text>
          <Text style={styles.meta}>
            {item.quantity ? `${item.quantity} ${item.unit ?? ''}`.trim() : item.category} · {item.location}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.status, { color: TONE_COLORS[status.tone] }]}>
            {status.text}
          </Text>
          <Pressable hitSlop={10} onPress={() => openMenu(item)} style={styles.more}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6b5b4a" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Lemari</Text>
            <Text style={styles.subtitle}>bahan yang lo punya</Text>
          </View>
          <Pressable style={styles.addButton} onPress={() => router.push('/add-ingredient')}>
            <Ionicons name="add" size={34} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={22} color="#2f4a2a" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Cari bahan..."
              placeholderTextColor="#7b8466"
            />
          </View>
          <Pressable
            style={[styles.filterButton, sortSoon && styles.filterActive]}
            onPress={() => setSortSoon((v) => !v)}
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
          <Pressable
            style={[styles.chip, active === 'All' && styles.chipActive]}
            onPress={() => setCategory('All')}
          >
            <Text style={[styles.chipText, active === 'All' && styles.chipTextActive]}>
              All {fridge.length}
            </Text>
          </Pressable>
          {categories.map(([name, count]) => (
            <Pressable
              key={name}
              style={[styles.chip, active === name && styles.chipActive]}
              onPress={() => setCategory(name)}
            >
              <Text style={[styles.chipText, active === name && styles.chipTextActive]}>
                {name} {count}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Bahan milikmu</Text>
          {sortSoon && <Text style={styles.sortHint}>urut: segera habis</Text>}
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          fridge.length === 0 ? (
            <View>
              <Text style={styles.empty}>Lemarimu masih kosong.</Text>
              <Pressable style={styles.scanButton} onPress={() => router.push('/camera')}>
                <Text style={styles.scanText}>Scan bahan</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.empty}>Tidak ada bahan yang cocok.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  top: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 36, fontWeight: '700', color: '#3b2412' },
  subtitle: { fontSize: 14, color: '#7a6a58' },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8a5a2b',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  empty: { textAlign: 'center', color: '#8a7a68', marginTop: 24, marginBottom: 16 },
  scanButton: {
    backgroundColor: '#8a5a2b',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcefc3',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#f1e2b4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  cardMain: { flex: 1, marginLeft: 12, marginRight: 8 },
  name: { fontSize: 17, fontWeight: '700', color: '#3b2412' },
  meta: { fontSize: 13, color: '#6b5b4a', marginTop: 2 },
  cardRight: { width: 126, alignItems: 'flex-start' },
  status: { fontSize: 12, fontWeight: '500' },
  more: { alignSelf: 'flex-end', marginTop: 2 },
});