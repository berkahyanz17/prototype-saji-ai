import { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from './ui';
import { Alert } from './AlertHost';
import { useFridge } from './FridgeContext';
import { AD_REWARD, FREE_DAILY } from './plan';

let opener: ((startAd: boolean) => void) | null = null;

// Opens the out-of-credits sheet; with startAd = true it goes straight to the demo ad
export const openPaywall = (startAd = false) => opener?.(startAd);

const AD_SECONDS = 5;

export function PaywallHost() {
  const router = useRouter();
  const { creditsLeft, adsLeft, watchAd } = useFridge();
  const [visible, setVisible] = useState(false);
  const [watching, setWatching] = useState(false);
  const [seconds, setSeconds] = useState(AD_SECONDS);

  useEffect(() => {
    opener = (startAd) => {
      setVisible(true);
      if (startAd) {
        setSeconds(AD_SECONDS);
        setWatching(true);
      }
    };
    return () => {
      opener = null;
    };
  }, []);

  // Countdown for the demo ad
  useEffect(() => {
    if (!watching || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [watching, seconds]);

  const close = () => {
    setWatching(false);
    setVisible(false);
  };

  const startAd = () => {
    setSeconds(AD_SECONDS);
    setWatching(true);
  };

  const claim = () => {
    const ok = watchAd();
    close();
    if (ok) Alert.alert('Kredit bertambah', `+${AD_REWARD} kredit AI. Selamat mencoba!`);
  };

  const goPlus = () => {
    close();
    router.push('/shop');
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" statusBarTranslucent visible onRequestClose={close}>
      <View style={styles.overlay}>
        {watching ? (
          <View style={styles.adCard}>
            <Text style={styles.adTag}>Iklan (demo)</Text>
            <Text style={styles.adTitle}>Ruang iklan</Text>
            <Text style={styles.adBody}>
              Di aplikasi sungguhan, iklan video Google AdMob tampil di sini.
            </Text>
            {seconds > 0 ? (
              <Text style={styles.adCount}>Hadiah dalam {seconds} detik</Text>
            ) : (
              <Pressable style={styles.primary} onPress={claim}>
                <Text style={styles.primaryText}>Ambil +{AD_REWARD} kredit</Text>
              </Pressable>
            )}
            <Pressable onPress={close} hitSlop={10}>
              <Text style={styles.skip}>Lewati tanpa hadiah</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>
              {creditsLeft > 0 ? 'Kredit AI' : 'Kredit AI habis'}
            </Text>
            <Text style={styles.body}>
              Scan foto dan resep AI memakai 1 kredit. Kamu mendapat {FREE_DAILY} kredit gratis
              setiap hari, reset otomatis tengah malam.
            </Text>

            <Pressable
              style={[styles.option, adsLeft === 0 && styles.disabled]}
              onPress={startAd}
              disabled={adsLeft === 0}
            >
              <Text style={styles.optionTitle}>Tonton iklan · +{AD_REWARD} kredit</Text>
              <Text style={styles.optionSub}>
                {adsLeft > 0 ? `Sisa ${adsLeft} iklan hari ini` : 'Batas iklan hari ini tercapai'}
              </Text>
            </Pressable>

            <Pressable style={[styles.option, styles.optionPlus]} onPress={goPlus}>
              <Text style={[styles.optionTitle, styles.optionPlusText]}>
                ✦ Coba Saji Plus
              </Text>
              <Text style={[styles.optionSub, styles.optionPlusText]}>
                AI tanpa batas dan tanpa iklan
              </Text>
            </Pressable>

            <Pressable onPress={close} hitSlop={10}>
              <Text style={styles.skip}>Nanti saja</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(70,43,14,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: { backgroundColor: '#fff7eb', borderRadius: 24, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#462b0e' },
  body: { fontSize: 14, color: '#605c5a', lineHeight: 21, marginTop: 8, marginBottom: 16 },
  option: {
    backgroundColor: '#fbefc8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  optionPlus: { backgroundColor: '#20392e' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#462b0e' },
  optionSub: { fontSize: 12, color: '#605c5a', marginTop: 2 },
  optionPlusText: { color: '#d0e588' },
  disabled: { opacity: 0.45 },
  skip: { textAlign: 'center', color: '#8a7a68', fontSize: 14, marginTop: 8 },
  adCard: {
    backgroundColor: '#20392e',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  adTag: { fontSize: 11, color: '#d0e588', fontWeight: '700' },
  adTitle: { fontSize: 26, fontWeight: '700', color: '#fff' },
  adBody: { fontSize: 13, color: '#cfd8cf', textAlign: 'center', lineHeight: 19 },
  adCount: { fontSize: 16, color: '#fff', marginVertical: 14 },
  primary: {
    backgroundColor: '#d0e588',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 22,
    marginVertical: 10,
  },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#20392e' },
});