import { View, Text, Pressable, ScrollView, StyleSheet } from '../lib/ui';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { formatDate, formatMass, wasteRate } from '../lib/impact';

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { impact } = useFridge();
  const rate = wasteRate(impact);
  const empty = impact.cookCount === 0 && impact.wastedItems === 0;

  const share = async () => {
    try {
      await Share.share({
        message: `Dengan Saji AI aku sudah memanfaatkan ${formatMass(
          impact.usedGrams
        )} bahan makanan, ${formatMass(
          impact.rescuedGrams
        )} di antaranya hampir kedaluwarsa. Yuk kurangi food waste dari dapur sendiri!`,
      });
    } catch {
      // sharing was cancelled
    }
  };

  const cards = [
    {
      label: 'Hampir kedaluwarsa, tapi dimasak',
      value: formatMass(impact.rescuedGrams),
      sub: `${impact.rescuedItems} bahan`,
    },
    {
      label: 'Terbuang',
      value: formatMass(impact.wastedGrams),
      sub: `${impact.wastedItems} bahan`,
    },
    { label: 'Waste rate', value: rate === null ? '–' : `${rate}%`, sub: 'terbuang dari total' },
    { label: 'Resep dimasak', value: String(impact.cookCount), sub: 'kali' },
  ];

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
          <Text style={styles.title}>Dampak kamu</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroNumber}>{formatMass(impact.usedGrams)}</Text>
          <Text style={styles.heroLabel}>bahan dimanfaatkan</Text>
        </View>

        {empty && (
          <Text style={styles.empty}>
            Belum ada data. Masak sebuah resep dan tekan Selesai memasak untuk mulai
            menghitung.
          </Text>
        )}

        <View style={styles.grid}>
          {cards.map((c) => (
            <View key={c.label} style={styles.card}>
              <Text style={styles.cardValue}>{c.value}</Text>
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={styles.cardSub}>{c.sub}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.shareButton} onPress={share}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareText}>Bagikan dampakmu</Text>
        </Pressable>

        <View style={styles.how}>
          <Text style={styles.howTitle}>Cara menghitung</Text>
          <Text style={styles.howBody}>
            Dimanfaatkan: bahan yang kamu kurangi dari lemari lewat Selesai memasak.
          </Text>
          <Text style={styles.howBody}>
            Hampir kedaluwarsa: bagian dari itu yang dimasak saat kedaluwarsanya 2 hari lagi atau
            sudah lewat.
          </Text>
          <Text style={styles.howBody}>
            Terbuang: bahan yang kamu hapus dari lemari setelah lewat tanggal kedaluwarsa.
          </Text>
          <Text style={styles.howBody}>
            Waste rate: terbuang dibagi (dimanfaatkan + terbuang).
          </Text>
          <Text style={styles.howNote}>
            Angka memakai jumlah stok di aplikasi, sebagian berupa perkiraan (bertanda ~ di
            Lemari). Dihitung sejak {formatDate(impact.since)}.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  hero: {
    backgroundColor: '#d0e588',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroNumber: { fontSize: 44, fontWeight: '700', color: '#2c311e' },
  heroLabel: { fontSize: 15, color: '#2c311e' },
  empty: { fontSize: 13, color: '#605c5a', textAlign: 'center', marginBottom: 14, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: {
    width: '48%',
    backgroundColor: '#fbefc8',
    borderRadius: 18,
    padding: 14,
  },
  cardValue: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  cardLabel: { fontSize: 13, fontWeight: '600', color: '#462b0e', marginTop: 2 },
  cardSub: { fontSize: 12, color: '#605c5a', marginTop: 2 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  shareText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  how: { backgroundColor: '#fffaf3', borderRadius: 16, padding: 14, marginTop: 16 },
  howTitle: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginBottom: 6 },
  howBody: { fontSize: 13, color: '#1e1e1e', lineHeight: 19, marginBottom: 6 },
  howNote: { fontSize: 12, color: '#605c5a', lineHeight: 18, marginTop: 4 },
});