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
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge, type FridgeItem } from '../../lib/FridgeContext';
import { emojiFor, expiryStatus, type Location, type Tone } from '../../lib/foodInfo';
import { UNIT_OPTIONS, formatQty } from '../../lib/ingredients';
import { AppMascot } from '../../lib/AppMascot';

const TONE_COLORS: Record<Tone, string> = {
  urgent: '#b4541a',
  fresh: '#1f6f2e',
  far: '#3b2412',
  expired: '#b91c1c',
};

const LOCATIONS: { label: string; value: Location }[] = [
  { label: 'Lemari', value: 'rak' },
  { label: 'Kulkas', value: 'kulkas' },
  { label: 'Freezer', value: 'freezer' },
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function FridgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, removeFromFridge, updateItem } = useFridge();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortSoon, setSortSoon] = useState(false);

  const [editing, setEditing] = useState<FridgeItem | null>(null);
  const [qtyText, setQtyText] = useState('');
  const [unit, setUnit] = useState('g');
  const [loc, setLoc] = useState<Location>('rak');

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

  const openEdit = (item: FridgeItem) => {
    setEditing(item);
    setQtyText(item.quantity !== undefined ? formatQty(item.quantity) : '');
    setUnit(item.unit ?? 'g');
    setLoc(item.location);
  };

  const saveEdit = () => {
    if (!editing) return;
    const trimmed = qtyText.trim();
    if (trimmed) {
      const value = Number(trimmed.replace(',', '.'));
      if (!isFinite(value) || value <= 0) {
        Alert.alert('Jumlah tidak valid', 'Isi jumlah dengan angka lebih dari 0.');
        return;
      }
      updateItem(editing.id, { quantity: value, unit, location: loc });
    } else {
      updateItem(editing.id, { location: loc });
    }
    setEditing(null);
  };

  const openMenu = (item: FridgeItem) =>
    Alert.alert(capitalize(item.name), undefined, [
      { text: 'Ubah jumlah / lokasi', onPress: () => openEdit(item) },
      { text: 'Hapus', style: 'destructive', onPress: () => removeFromFridge(item.id) },
      { text: 'Batal', style: 'cancel' },
    ]);

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const status = expiryStatus(item.expiresAt);
    const amount =
      item.quantity !== undefined
        ? `${item.estimated ? '~' : ''}${formatQty(item.quantity)} ${item.unit ?? ''}`.trim()
        : item.category;
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
            {amount} · {item.location}
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
            <Text style={styles.subtitle}>bahan yang kamu punya</Text>
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
              <View style={styles.emptyWrap}>
                <AppMascot mood="biasa" size={110} />
                <Text style={styles.empty}>Lemarimu masih kosong.</Text>
              </View>
              <Pressable style={styles.scanButton} onPress={() => router.push('/camera')}>
                <Text style={styles.scanText}>Scan bahan</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.empty}>Tidak ada bahan yang cocok.</Text>
          )
        }
      />

      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{editing ? capitalize(editing.name) : ''}</Text>

            <Text style={styles.sheetLabel}>Jumlah</Text>
            <TextInput
              style={styles.sheetInput}
              value={qtyText}
              onChangeText={setQtyText}
              placeholder="Kosongkan jika tidak diubah"
              placeholderTextColor="#9a8c7c"
              keyboardType="decimal-pad"
            />

            <Text style={styles.sheetLabel}>Satuan</Text>
            <View style={styles.sheetChips}>
              {UNIT_OPTIONS.map((u) => (
                <Pressable
                  key={u}
                  style={[styles.sheetChip, unit === u && styles.sheetChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.sheetChipText, unit === u && styles.sheetChipTextActive]}>
                    {u}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Simpan di</Text>
            <View style={styles.sheetChips}>
              {LOCATIONS.map((l) => (
                <Pressable
                  key={l.value}
                  style={[styles.sheetChip, loc === l.value && styles.sheetChipActive]}
                  onPress={() => setLoc(l.value)}
                >
                  <Text
                    style={[styles.sheetChipText, loc === l.value && styles.sheetChipTextActive]}
                  >
                    {l.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sheetHint}>
              Mengubah lokasi menghitung ulang perkiraan kedaluwarsa.
            </Text>

            <View style={styles.sheetActions}>
              <Pressable style={styles.sheetCancel} onPress={() => setEditing(null)}>
                <Text style={styles.sheetCancelText}>Batal</Text>
              </Pressable>
              <Pressable style={styles.sheetSave} onPress={saveEdit}>
                <Text style={styles.sheetSaveText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    emptyWrap: { alignItems: 'center', marginTop: 12 },
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingHorizontal: 20,
  },
  sheet: { backgroundColor: '#fff7eb', borderRadius: 20, padding: 18 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#3b2412', marginBottom: 4 },
  sheetLabel: { fontSize: 13, fontWeight: '700', color: '#462b0e', marginTop: 14, marginBottom: 8 },
  sheetInput: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    color: '#2b2118',
  },
  sheetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sheetChipActive: { backgroundColor: '#8f9a6a', borderColor: '#8f9a6a' },
  sheetChipText: { fontSize: 13, color: '#462b0e' },
  sheetChipTextActive: { color: '#fff', fontWeight: '600' },
  sheetHint: { fontSize: 11, color: '#605c5a', marginTop: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  sheetCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetCancelText: { color: '#462b0e', fontWeight: '600' },
  sheetSave: {
    flex: 1,
    backgroundColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetSaveText: { color: '#fff', fontWeight: '600' },
});