import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { openPaywall } from '../lib/PaywallHost';
import { AD_REWARD, BENEFITS, FREE_DAILY, PLANS, type PlanId } from '../lib/plan';
import { formatRp } from '../lib/prefs';

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPlus, plus, creditsLeft, adsLeft, activatePlus, cancelPlus } = useFridge();
  const [plan, setPlan] = useState<PlanId>('tahunan');

  const subscribe = () =>
    Alert.alert(
      'Mode demo',
      'Pembayaran belum terhubung ke Google Play. Aktifkan Saji Plus untuk pengujian?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Aktifkan',
          onPress: () => {
            activatePlus(plan);
            Alert.alert('Saji Plus aktif', 'Terima kasih! Scan dan resep AI kini tanpa batas.');
          },
        },
      ]
    );

  const stop = () =>
    Alert.alert('Hentikan Saji Plus?', 'Kamu kembali ke paket gratis (demo).', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hentikan', style: 'destructive', onPress: cancelPlus },
    ]);

  const planTitle = PLANS.find((p) => p.id === plus.plan)?.title ?? '';

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
          <Text style={styles.title}>Toko</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>✦ Saji Plus</Text>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color="#d0e588" />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {isPlus ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>Saji Plus aktif</Text>
            <Text style={styles.activeSub}>Paket {planTitle} (demo)</Text>
            <Pressable style={styles.outlineButton} onPress={stop}>
              <Text style={styles.outlineText}>Hentikan (demo)</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Pilih paket</Text>
            <View style={styles.plans}>
              {PLANS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.plan, plan === p.id && styles.planActive]}
                  onPress={() => setPlan(p.id)}
                >
                  <Text style={styles.planTitle}>{p.title}</Text>
                  <Text style={styles.planPrice}>Rp{formatRp(p.price)}</Text>
                  <Text style={styles.planNote}>{p.note}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.cta} onPress={subscribe}>
              <Text style={styles.ctaText}>Mulai Saji Plus</Text>
            </Pressable>
            <Text style={styles.small}>Harga contoh. Batalkan kapan saja di Google Play.</Text>
          </>
        )}

        <Text style={styles.section}>Kredit AI hari ini</Text>
        <View style={styles.creditCard}>
          <Text style={styles.creditNumber}>{isPlus ? '∞' : `${creditsLeft}/${FREE_DAILY}`}</Text>
          <Text style={styles.creditLabel}>
            {isPlus ? 'tanpa batas dengan Saji Plus' : 'kredit tersisa, reset tengah malam'}
          </Text>
          {!isPlus && (
            <Pressable
              style={[styles.adButton, adsLeft === 0 && styles.disabled]}
              onPress={() => openPaywall(true)}
              disabled={adsLeft === 0}
            >
              <Text style={styles.adText}>
                {adsLeft > 0
                  ? `Tonton iklan (+${AD_REWARD}) · sisa ${adsLeft}`
                  : 'Batas iklan hari ini tercapai'}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.section}>Kustomisasi profil</Text>
        <View style={[styles.creditCard, styles.disabled]}>
          <Text style={styles.creditLabel}>Bingkai, latar, dan skin maskot. Segera hadir.</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Mode demo: pembayaran dan iklan belum terhubung. Pembelian dan iklan sungguhan
            memerlukan build aplikasi dan akun Google Play.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  hero: { backgroundColor: '#20392e', borderRadius: 22, padding: 18, gap: 8 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#d0e588', marginBottom: 4 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { flex: 1, fontSize: 14, color: '#fff' },
  section: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginTop: 20, marginBottom: 10 },
  plans: { flexDirection: 'row', gap: 12 },
  plan: {
    flex: 1,
    backgroundColor: '#fffaf3',
    borderWidth: 2,
    borderColor: '#e8dcc6',
    borderRadius: 18,
    padding: 14,
  },
  planActive: { borderColor: '#20392e', backgroundColor: '#e3efdc' },
  planTitle: { fontSize: 14, fontWeight: '700', color: '#462b0e' },
  planPrice: { fontSize: 20, fontWeight: '700', color: '#20392e', marginTop: 4 },
  planNote: { fontSize: 11, color: '#605c5a', marginTop: 2 },
  cta: {
    backgroundColor: '#462b0e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  small: { fontSize: 11, color: '#8a7a68', textAlign: 'center', marginTop: 8 },
  activeCard: {
    backgroundColor: '#d0e588',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  activeTitle: { fontSize: 20, fontWeight: '700', color: '#2c311e' },
  activeSub: { fontSize: 13, color: '#2c311e', marginBottom: 12 },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#2c311e',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  outlineText: { color: '#2c311e', fontWeight: '700' },
  creditCard: { backgroundColor: '#fbefc8', borderRadius: 18, padding: 16, alignItems: 'center' },
  creditNumber: { fontSize: 34, fontWeight: '700', color: '#462b0e' },
  creditLabel: { fontSize: 13, color: '#605c5a', textAlign: 'center' },
  adButton: {
    backgroundColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  adText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  disabled: { opacity: 0.5 },
  note: { backgroundColor: '#fffaf3', borderRadius: 14, padding: 12, marginTop: 20 },
  noteText: { fontSize: 12, color: '#605c5a', lineHeight: 18 },
});