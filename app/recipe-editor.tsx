import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from '../lib/ui';
import { Modal } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import {
  INGREDIENTS,
  STAPLE_IDS,
  UNIT_OPTIONS,
  findIngredient,
  parseAmount,
  type Ingredient,
} from '../lib/ingredients';
import type { Recipe, RecipeIngredient } from '../lib/recipes';

type IngRow = { key: string; name: string; qty: string; unit: string };
type StepRow = { key: string; text: string };

const uid = () => Math.random().toString(36).slice(2, 9);

const EMOJIS = [
  '🍳', '🍚', '🍜', '🍲', '🥘', '🍛', '🥗', '🍝', '🍤', '🍗', '🥩', '🐟',
  '🥟', '🍢', '🍞', '🥞', '🌮', '🥪', '🍱', '🍰', '🥚', '🥬', '🍅', '🍲',
];

const blankIng = (): IngRow => ({ key: uid(), name: '', qty: '', unit: 'g' });
const blankStep = (): StepRow => ({ key: uid(), text: '' });

function initialFrom(recipe?: Recipe) {
  if (!recipe) {
    return {
      emoji: '🍳',
      name: '',
      minutes: '',
      servings: '1',
      ings: [blankIng()],
      steps: [blankStep()],
    };
  }
  const ings = recipe.ingredients.map((ri) => {
    const p = parseAmount(ri.amount);
    return { key: uid(), name: ri.name, qty: p ? String(p.qty) : '', unit: p ? p.unit : 'g' };
  });
  return {
    emoji: recipe.emoji,
    name: recipe.name === 'Draf tanpa judul' ? '' : recipe.name,
    minutes: recipe.minutes ? String(recipe.minutes) : '',
    servings: String(recipe.servings || 1),
    ings: ings.length > 0 ? ings : [blankIng()],
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((t) => ({ key: uid(), text: t }))
        : [blankStep()],
  };
}

const snapshotOf = (
  emoji: string,
  name: string,
  minutes: string,
  servings: string,
  ings: IngRow[],
  steps: StepRow[]
) =>
  JSON.stringify([
    emoji,
    name,
    minutes,
    servings,
    ings.map((i) => [i.name, i.qty, i.unit]),
    steps.map((s) => s.text),
  ]);

function suggestionsFor(text: string): Ingredient[] {
  const s = text.trim().toLowerCase();
  if (!s) return [];
  if (INGREDIENTS.some((i) => i.name === s)) return [];
  return INGREDIENTS.filter(
    (i) => i.name.includes(s) || i.aliases.some((a) => a.toLowerCase().startsWith(s))
  ).slice(0, 5);
}

function toIngredient(row: IngRow): RecipeIngredient {
  const name = row.name.trim();
  const db = findIngredient(name.toLowerCase());
  const qty = Number(row.qty.replace(',', '.'));
  const amount = qty > 0 ? `${Math.round(qty * 100) / 100} ${row.unit}` : 'secukupnya';
  const keywords = Array.from(new Set([name.toLowerCase(), ...(db ? [db.name.toLowerCase()] : [])]));
  return { name, amount, keywords, staple: db ? STAPLE_IDS.includes(db.id) : false };
}

export default function RecipeEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { userRecipes, saveUserRecipe, deleteUserRecipe } = useFridge();

  const existing = id ? userRecipes.find((r) => r.id === String(id)) : undefined;
  const isPublished = !!existing && !existing.draft;

  const [init] = useState(() => initialFrom(existing));
  const [emoji, setEmoji] = useState(init.emoji);
  const [name, setName] = useState(init.name);
  const [minutes, setMinutes] = useState(init.minutes);
  const [servings, setServings] = useState(init.servings);
  const [ings, setIngs] = useState<IngRow[]>(init.ings);
  const [steps, setSteps] = useState<StepRow[]>(init.steps);
  const [focused, setFocused] = useState<number | null>(null);
  const [unitFor, setUnitFor] = useState<number | null>(null);

  const [initialSnap] = useState(() =>
    snapshotOf(init.emoji, init.name, init.minutes, init.servings, init.ings, init.steps)
  );
  const dirty = snapshotOf(emoji, name, minutes, servings, ings, steps) !== initialSnap;

  const doneRef = useRef(false);
  const dirtyRef = useRef(false);
  const saveRef = useRef<(asDraft: boolean) => void>(() => {});

  const updateIng = (index: number, patch: Partial<IngRow>) =>
    setIngs((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const removeIng = (index: number) =>
    setIngs((prev) => (prev.length === 1 ? [blankIng()] : prev.filter((_, i) => i !== index)));

  const pickSuggestion = (index: number, s: Ingredient) => {
    updateIng(index, { name: s.name, unit: s.unit });
    setFocused(null);
  };

  const updateStep = (index: number, text: string) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, text } : s)));

  const moveStep = (index: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const to = index + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  const removeStep = (index: number) =>
    setSteps((prev) => (prev.length === 1 ? [blankStep()] : prev.filter((_, i) => i !== index)));

  const validate = (rows: IngRow[], stepTexts: string[]): string | null => {
    if (!name.trim()) return 'Isi nama resep dulu.';
    const mins = Math.round(Number(minutes.replace(',', '.')));
    if (!(mins > 0)) return 'Isi waktu memasak dalam menit.';
    const serv = Math.round(Number(servings.replace(',', '.')));
    if (!(serv >= 1)) return 'Porsi minimal 1.';
    if (rows.length === 0) return 'Tambahkan minimal satu bahan.';
    for (const row of rows) {
      const db = findIngredient(row.name.trim().toLowerCase());
      const staple = db ? STAPLE_IDS.includes(db.id) : false;
      const qty = Number(row.qty.replace(',', '.'));
      if (!(qty > 0) && !staple) return `Isi jumlah untuk ${row.name.trim()}.`;
    }
    if (stepTexts.length === 0) return 'Tambahkan minimal satu langkah.';
    return null;
  };

  const submit = (asDraft: boolean) => {
    const rows = ings.filter((r) => r.name.trim());
    const stepTexts = steps.map((s) => s.text.trim()).filter(Boolean);

    if (asDraft) {
      if (!name.trim() && rows.length === 0 && stepTexts.length === 0) {
        Alert.alert('Draf kosong', 'Isi nama, bahan, atau langkah dulu.');
        return;
      }
    } else {
      const problem = validate(rows, stepTexts);
      if (problem) {
        Alert.alert('Belum lengkap', problem);
        return;
      }
    }

    const mins = Math.max(0, Math.round(Number(minutes.replace(',', '.')) || 0));
    const serv = Math.max(1, Math.round(Number(servings.replace(',', '.')) || 1));

    const recipe: Recipe = {
      id: existing?.id ?? `user-${Date.now()}`,
      name: name.trim() || 'Draf tanpa judul',
      emoji,
      minutes: mins,
      servings: serv,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      ingredients: rows.map(toIngredient),
      steps: stepTexts,
      custom: true,
      draft: asDraft,
    };

    saveUserRecipe(recipe);
    doneRef.current = true;
    router.back();
    Alert.alert(
      asDraft ? 'Draf tersimpan' : 'Resep tersimpan',
      asDraft
        ? 'Lanjutkan kapan saja dari "Resepku".'
        : 'Resepmu sudah masuk ke daftar resep.'
    );
  };

  // Keep the latest values available to the back-button guard
  useEffect(() => {
    dirtyRef.current = dirty;
    saveRef.current = submit;
  });

  // Ask before leaving with unsaved changes (also covers the hardware back button)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (doneRef.current || !dirtyRef.current) return;
      e.preventDefault();
      const discard = {
        text: 'Buang',
        style: 'destructive' as const,
        onPress: () => {
          doneRef.current = true;
          navigation.dispatch(e.data.action);
        },
      };
      const keep = { text: 'Lanjut mengedit', style: 'cancel' as const };
      Alert.alert(
        'Simpan perubahan?',
        'Perubahanmu belum disimpan.',
        isPublished
          ? [keep, discard]
          : [keep, discard, { text: 'Simpan draf', onPress: () => saveRef.current(true) }]
      );
    });
    return unsubscribe;
  }, [navigation, isPublished]);

  const remove = () => {
    if (!existing) return;
    Alert.alert('Hapus resep?', 'Resep ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          doneRef.current = true;
          deleteUserRecipe(existing.id);
          router.navigate('/recipes');
        },
      },
    ]);
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
          <Text style={styles.title}>{existing ? 'Edit resep' : 'Buat resep'}</Text>
          {existing ? (
            <Pressable onPress={remove} hitSlop={10}>
              <Ionicons name="trash-outline" size={24} color="#b91c1c" />
            </Pressable>
          ) : (
            <View style={styles.sideSpace} />
          )}
        </View>

        <Text style={styles.label}>Ikon masakan</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((e, i) => (
            <Pressable
              key={`${e}-${i}`}
              style={[styles.emojiBox, emoji === e && styles.emojiActive]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Nama resep</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Nasi goreng telur"
          placeholderTextColor="#9a8c7c"
          maxLength={60}
        />

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Text style={styles.label}>Waktu (menit)</Text>
            <TextInput
              style={styles.input}
              value={minutes}
              onChangeText={setMinutes}
              placeholder="20"
              placeholderTextColor="#9a8c7c"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Porsi</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              placeholder="1"
              placeholderTextColor="#9a8c7c"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Bahan-bahan</Text>
        <Text style={styles.hint}>
          Isi jumlah untuk seluruh resep. Jumlah dipakai untuk mengurangi stok dan menghitung
          nutrisi.
        </Text>
        {ings.map((row, index) => {
          const sugg = focused === index ? suggestionsFor(row.name) : [];
          const unknown =
            focused !== index && row.name.trim() !== '' && !findIngredient(row.name.toLowerCase());
          return (
            <View key={row.key} style={styles.ingBlock}>
              <View style={styles.ingRow}>
                <TextInput
                  style={[styles.input, styles.ingName]}
                  value={row.name}
                  onChangeText={(t) => updateIng(index, { name: t })}
                  onFocus={() => setFocused(index)}
                  placeholder="Nama bahan"
                  placeholderTextColor="#9a8c7c"
                />
                <TextInput
                  style={[styles.input, styles.ingQty]}
                  value={row.qty}
                  onChangeText={(t) => updateIng(index, { qty: t })}
                  onFocus={() => setFocused(null)}
                  placeholder="0"
                  placeholderTextColor="#9a8c7c"
                  keyboardType="decimal-pad"
                />
                <Pressable style={styles.unitBtn} onPress={() => setUnitFor(index)}>
                  <Text style={styles.unitText}>{row.unit}</Text>
                  <Ionicons name="caret-down" size={11} color="#462b0e" />
                </Pressable>
                <Pressable onPress={() => removeIng(index)} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color="#b91c1c" />
                </Pressable>
              </View>
              {sugg.length > 0 && (
                <View style={styles.suggs}>
                  {sugg.map((s) => (
                    <Pressable
                      key={s.id}
                      style={styles.sugg}
                      onPress={() => pickSuggestion(index, s)}
                    >
                      <Text style={styles.suggText}>{s.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {unknown && (
                <Text style={styles.warn}>Tidak ada di database: tanpa data nutrisi</Text>
              )}
            </View>
          );
        })}
        <Pressable style={styles.addButton} onPress={() => setIngs((p) => [...p, blankIng()])}>
          <Ionicons name="add" size={18} color="#462b0e" />
          <Text style={styles.addText}>Tambah bahan</Text>
        </Pressable>

        <Text style={styles.label}>Langkah-langkah</Text>
        {steps.map((s, index) => (
          <View key={s.key} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={s.text}
              onChangeText={(t) => updateStep(index, t)}
              placeholder="Tulis langkah..."
              placeholderTextColor="#9a8c7c"
              multiline
            />
            <View style={styles.stepTools}>
              <Pressable onPress={() => moveStep(index, -1)} hitSlop={6}>
                <Ionicons name="chevron-up" size={20} color="#462b0e" />
              </Pressable>
              <Pressable onPress={() => moveStep(index, 1)} hitSlop={6}>
                <Ionicons name="chevron-down" size={20} color="#462b0e" />
              </Pressable>
              <Pressable onPress={() => removeStep(index)} hitSlop={6}>
                <Ionicons name="close" size={20} color="#b91c1c" />
              </Pressable>
            </View>
          </View>
        ))}
        <Pressable style={styles.addButton} onPress={() => setSteps((p) => [...p, blankStep()])}>
          <Ionicons name="add" size={18} color="#462b0e" />
          <Text style={styles.addText}>Tambah langkah</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        {isPublished ? (
          <Pressable style={styles.primary} onPress={() => submit(false)}>
            <Text style={styles.primaryText}>Simpan perubahan</Text>
          </Pressable>
        ) : (
          <View style={styles.bottomRow}>
            <Pressable style={styles.secondary} onPress={() => submit(true)}>
              <Text style={styles.secondaryText}>Simpan draf</Text>
            </Pressable>
            <Pressable style={[styles.primary, styles.primaryFlex]} onPress={() => submit(false)}>
              <Text style={styles.primaryText}>Simpan resep</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={unitFor !== null}
        onRequestClose={() => setUnitFor(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setUnitFor(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pilih satuan</Text>
            <View style={styles.sheetChips}>
              {UNIT_OPTIONS.map((u) => (
                <Pressable
                  key={u}
                  style={[
                    styles.sheetChip,
                    unitFor !== null && ings[unitFor]?.unit === u && styles.sheetChipActive,
                  ]}
                  onPress={() => {
                    if (unitFor !== null) updateIng(unitFor, { unit: u });
                    setUnitFor(null);
                  }}
                >
                  <Text
                    style={[
                      styles.sheetChipText,
                      unitFor !== null && ings[unitFor]?.unit === u && styles.sheetChipTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sideSpace: { width: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  label: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginTop: 18, marginBottom: 8 },
  hint: { fontSize: 12, color: '#605c5a', marginBottom: 8, lineHeight: 17 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fffaf3',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiActive: { borderColor: '#462b0e', backgroundColor: '#fbefc8' },
  emojiText: { fontSize: 24 },
  input: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2b2118',
  },
  twoCols: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  ingBlock: { marginBottom: 10 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ingName: { flex: 1 },
  ingQty: { width: 58, textAlign: 'center' },
  unitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 68,
    height: 44,
    backgroundColor: '#fbefc8',
    borderRadius: 12,
  },
  unitText: { fontSize: 13, fontWeight: '600', color: '#462b0e' },
  suggs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  sugg: {
    backgroundColor: '#d4e8a2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggText: { fontSize: 13, color: '#0c361d', fontWeight: '600' },
  warn: { fontSize: 11, color: '#b4541a', marginTop: 4 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  addText: { fontSize: 14, fontWeight: '600', color: '#462b0e' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#d4e8a2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  stepNumberText: { fontWeight: '700', color: '#20392e' },
  stepInput: { flex: 1, minHeight: 44, textAlignVertical: 'top' },
  stepTools: { alignItems: 'center', gap: 4, paddingTop: 2 },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  bottomRow: { flexDirection: 'row', gap: 10 },
  primary: {
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryFlex: { flex: 1 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondary: {
    borderWidth: 1.5,
    borderColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  secondaryText: { color: '#462b0e', fontSize: 16, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(70,43,14,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: { backgroundColor: '#fff7eb', borderRadius: 20, padding: 18 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginBottom: 12 },
  sheetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sheetChipActive: { backgroundColor: '#8f9a6a', borderColor: '#8f9a6a' },
  sheetChipText: { fontSize: 14, color: '#462b0e' },
  sheetChipTextActive: { color: '#fff', fontWeight: '600' },
});