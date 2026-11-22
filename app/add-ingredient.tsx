import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { guessCategory, type Category, type Location } from '../lib/foodInfo';

const CATEGORIES: Category[] = ['Sayur', 'Bumbu', 'Produk susu', 'Protein', 'Karbo', 'Lainnya'];
const UNITS = ['gram', 'kg', 'ml', 'liter', 'buah', 'butir', 'ikat', 'bungkus', 'sdm'];
const LOCATIONS: { label: string; value: Location }[] = [
  { label: 'Lemari', value: 'rak' },
  { label: 'Kulkas', value: 'kulkas' },
  { label: 'Freezer', value: 'freezer' },
];

// Accepts DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY
const parseDate = (text: string): number | null => {
  const m = text.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(year, month - 1, day, 23, 59, 59);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date.getTime();
};

function Dropdown({
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
}: {
  value: string | null;
  placeholder: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (option: string) => void;
}) {
  return (
    <View>
      <Pressable style={styles.input} onPress={onToggle}>
        <Text style={value ? styles.inputText : styles.placeholder}>
          {value ?? placeholder}
        </Text>
        <Ionicons name={open ? 'caret-up' : 'caret-down'} size={14} color="#462b0e" />
      </Pressable>
      {open && (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable key={option} style={styles.option} onPress={() => onSelect(option)}>
              <Text style={[styles.optionText, option === value && styles.optionActive]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddIngredient() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useFridge();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('gram');
  const [dateText, setDateText] = useState('');
  const [location, setLocation] = useState<Location>('rak');
  const [open, setOpen] = useState<'category' | 'unit' | null>(null);

  // Until you pick one, the category is guessed from the name
  const shownCategory = category ?? (name.trim() ? guessCategory(name) : null);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nama bahan kosong', 'Isi nama bahan dulu.');
      return;
    }

    let qty: number | undefined;
    if (quantity.trim()) {
      qty = Number(quantity.replace(',', '.'));
      if (!isFinite(qty) || qty <= 0) {
        Alert.alert('Jumlah tidak valid', 'Isi jumlah dengan angka lebih dari 0.');
        return;
      }
    }

    let expiresAt: number | undefined;
    if (dateText.trim()) {
      const parsed = parseDate(dateText);
      if (parsed === null) {
        Alert.alert('Tanggal tidak valid', 'Gunakan format DD-MM-YYYY, contoh 25-12-2026.');
        return;
      }
      expiresAt = parsed;
    }

    const ok = addItem({
      name: trimmed,
      category: category ?? guessCategory(trimmed),
      location,
      quantity: qty,
      unit: qty ? unit : undefined,
      expiresAt,
    });

    if (!ok) {
      Alert.alert('Sudah ada', `${trimmed} sudah ada di lemarimu.`);
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.title}>Tambah Bahan</Text>
        </View>

        <Text style={styles.label}>Nama bahan</Text>
        <TextInput
          style={[styles.input, styles.inputText]}
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Wortel"
          placeholderTextColor="#9a8c7c"
        />

        <Text style={styles.label}>Kategori</Text>
        <Dropdown
          value={shownCategory}
          placeholder="Pilih kategori bahan"
          options={CATEGORIES}
          open={open === 'category'}
          onToggle={() => setOpen(open === 'category' ? null : 'category')}
          onSelect={(option) => {
            setCategory(option as Category);
            setOpen(null);
          }}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Jumlah</Text>
            <TextInput
              style={[styles.input, styles.inputText]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              placeholderTextColor="#9a8c7c"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Satuan</Text>
            <Dropdown
              value={unit}
              placeholder="Satuan"
              options={UNITS}
              open={open === 'unit'}
              onToggle={() => setOpen(open === 'unit' ? null : 'unit')}
              onSelect={(option) => {
                setUnit(option);
                setOpen(null);
              }}
            />
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Tanggal kedaluwarsa</Text>
          <Text style={styles.optional}>Opsional</Text>
        </View>
        <TextInput
          style={[styles.input, styles.inputText]}
          value={dateText}
          onChangeText={setDateText}
          placeholder="DD-MM-YYYY"
          placeholderTextColor="#9a8c7c"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Simpan di</Text>
        <View style={styles.segments}>
          {LOCATIONS.map((loc) => (
            <Pressable
              key={loc.value}
              style={[styles.segment, location === loc.value && styles.segmentActive]}
              onPress={() => setLocation(loc.value)}
            >
              <Text
                style={[styles.segmentText, location === loc.value && styles.segmentTextActive]}
              >
                {loc.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Simpan Bahan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  label: { fontSize: 14, fontWeight: '700', color: '#462b0e', marginTop: 16, marginBottom: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  optional: { fontSize: 11, color: '#8a7a68', marginBottom: 6 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputText: { fontSize: 15, color: '#2b2118' },
  placeholder: { fontSize: 15, color: '#9a8c7c' },
  options: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  option: { paddingHorizontal: 14, paddingVertical: 12 },
  optionText: { fontSize: 15, color: '#2b2118' },
  optionActive: { fontWeight: '700', color: '#20392e' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  segments: { flexDirection: 'row', gap: 10 },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dcc6',
    backgroundColor: '#fffaf3',
  },
  segmentActive: { backgroundColor: '#e3efdc', borderColor: '#7fa58a' },
  segmentText: { fontSize: 14, color: '#462b0e' },
  segmentTextActive: { fontWeight: '700', color: '#20392e' },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  saveButton: {
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});