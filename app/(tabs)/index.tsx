import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from '../../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { DAY_MS, emojiFor } from '../../lib/foodInfo';
import { rankRecipes } from '../../lib/recipes';
import RecipeCard from '../../lib/RecipeCard';

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Beranda() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, cookedDays, toggleCookedDay, recipes, profile } = useFridge();
  const [search, setSearch] = useState('');

  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam';

  const best = rankRecipes(
    fridge.map((i) => i.name),
    recipes
  )[0];
  const soonest = [...fridge].sort((a, b) => a.expiresAt - b.expiresAt)[0];
  const expiringCount = fridge.filter(
    (i) => i.expiresAt - Date.now() <= 2 * DAY_MS
  ).length;

  const soonestText = () => {
    const diff = soonest.expiresAt - Date.now();
    if (diff < 0) return 'sudah kedaluwarsa';
    const days = Math.max(1, Math.ceil(diff / DAY_MS));
    return `akan kedaluwarsa dalam ${days} hari`;
  };

  const submitSearch = () => {
    router.navigate({ pathname: '/recipes', params: { q: search.trim() } });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        paddingBottom: 24,
      }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Saji AI</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color="#462b0d" />
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <Ionicons name="settings-outline" size={24} color="#462b0d" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.greeting}>
        Selamat {greeting}, {profile.name}
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.streakCard}>
          <Text style={styles.streakTitle}>Streak masakan</Text>
          <View style={styles.days}>
            {DAY_LABELS.map((label, index) => (
              <Pressable
                key={index}
                style={[styles.day, cookedDays[index] && styles.dayDone]}
                onPress={() => toggleCookedDay(index)}
              >
                <Text style={[styles.dayText, cookedDays[index] && styles.dayTextDone]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.pantryCard}>
          <Text style={styles.pantryNumber}>{fridge.length}</Text>
          <Text style={styles.pantryLabel}>bahan di lemari</Text>
          <View style={styles.pantryLine} />
          <Text style={[styles.pantryNumber, styles.pantryWarn]}>{expiringCount}</Text>
          <Text style={styles.pantryLabel}>bahan akan kedaluwarsa</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={22} color="#20392e" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          placeholder="Cari resep..."
          placeholderTextColor="#7b8466"
        />
        <Pressable style={styles.smallButton} onPress={() => router.push('/camera')}>
          <Ionicons name="scan-outline" size={20} color="#20392e" />
        </Pressable>
        <Pressable style={styles.smallButton} onPress={() => router.push('/add-ingredient')}>
          <Ionicons name="add" size={22} color="#20392e" />
        </Pressable>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Olah sebelum basi</Text>
        <Pressable onPress={() => router.navigate('/fridge')}>
          <Text style={styles.seeAll}>Lihat semua</Text>
        </Pressable>
      </View>

      {soonest ? (
        <Pressable style={styles.expCard} onPress={() => router.navigate('/fridge')}>
          <Text style={styles.expEmoji}>{emojiFor(soonest.name, soonest.category)}</Text>
          <View style={styles.expInfo}>
            <Text style={styles.expName}>{capitalize(soonest.name)}</Text>
            <Text style={styles.expText}>{soonestText()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#462b0e" />
        </Pressable>
      ) : (
        <Pressable style={styles.expCard} onPress={() => router.push('/camera')}>
          <Text style={styles.expEmoji}>📷</Text>
          <View style={styles.expInfo}>
            <Text style={styles.expName}>Lemarimu masih kosong</Text>
            <Text style={styles.expText}>Scan bahan makananmu dulu</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#462b0e" />
        </Pressable>
      )}

      <Text style={[styles.section, styles.sectionSpaced]}>Rekomendasi menu</Text>
      <Text style={styles.sectionSub}>Ayo masak bahan yang kamu miliki</Text>
      <RecipeCard
        recipe={best.recipe}
        readyCount={best.readyCount}
        total={best.total}
        onPress={() =>
          router.push({ pathname: '/recipe/[id]', params: { id: best.recipe.id } })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontSize: 26, fontWeight: '800', color: '#462b0d' },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fbefc8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: '#462b0d', marginVertical: 18 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  streakCard: {
    flex: 190,
    backgroundColor: '#d0e588',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
  streakTitle: { fontSize: 19, fontWeight: '500', color: '#2c311e', marginBottom: 10 },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  day: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#def19f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: '#8fb83a' },
  dayText: { fontSize: 15, fontWeight: '700', color: '#2c311ecc' },
  dayTextDone: { color: '#fff' },
  pantryCard: {
    flex: 120,
    backgroundColor: '#abe4c2',
    borderRadius: 15,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pantryNumber: { fontSize: 32, fontWeight: '700', color: '#0c361d' },
  pantryWarn: { color: '#df7f4c' },
  pantryLabel: { fontSize: 13, fontWeight: '500', color: '#0c351d', textAlign: 'center' },
  pantryLine: { height: 1, alignSelf: 'stretch', backgroundColor: '#0c351d', marginVertical: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e9efc5',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 48,
    marginBottom: 18,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2b2118' },
  smallButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#e3e4c9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  section: { fontSize: 20, fontWeight: '700', color: '#462b0e' },
  sectionSpaced: { marginTop: 20 },
  sectionSub: { fontSize: 12, color: '#605c5a', marginBottom: 10 },
  seeAll: { fontSize: 12, fontWeight: '500', color: '#462b0ecc' },
  expCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefc8',
    borderRadius: 17,
    padding: 14,
  },
  expEmoji: { fontSize: 30, marginRight: 14 },
  expInfo: { flex: 1 },
  expName: { fontSize: 15, fontWeight: '700', color: '#462b0e' },
  expText: { fontSize: 12, color: '#605c5a', marginTop: 2 },
});