import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from '../lib/ui';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzePhoto, type ScanResult } from '../lib/api';
import { useFridge } from '../lib/FridgeContext';
import { findIngredient, formatQty } from '../lib/ingredients';

const WARNINGS: Record<string, string> = {
  screen: 'Foto ini sepertinya layar atau monitor, bukan bahan asli.',
  print: 'Foto ini sepertinya gambar cetak, bukan bahan asli.',
  unclear: 'Foto kurang jelas, hasil mungkin tidak akurat.',
};

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToFridge } = useFridge();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setUri(asset.uri);
    setResult(null);
    setSelected([]);
    if (!asset.base64) {
      Alert.alert('Foto gagal dibaca', 'Coba ambil foto lagi.');
      return;
    }
    setLoading(true);
    try {
      const res = await analyzePhoto(asset.base64);
      setResult(res);
      setSelected(res.ingredients);
    } catch (e) {
      Alert.alert(
        'Gagal menganalisis foto',
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses kamera untuk mengambil foto.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
    if (!res.canceled) await handleAsset(res.assets[0]);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    if (!res.canceled) await handleAsset(res.assets[0]);
  };

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const saveToFridge = () => {
    if (!result || selected.length === 0) {
      Alert.alert('Belum ada bahan', 'Ambil foto bahan dan pilih minimal satu bahan.');
      return;
    }
    const outcome = addToFridge(
      selected.map((name) => ({ name, count: result.counts?.[name] }))
    );
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const lines: string[] = [];
    if (outcome.added.length > 0) {
      lines.push(`Ditambahkan: ${outcome.added.map(cap).join(', ')}`);
    }
    outcome.merged.forEach((m) => {
      lines.push(
        m.before !== m.after
          ? `${cap(m.name)}: ${formatQty(m.before)} → ${formatQty(m.after)} ${m.unit ?? ''}`.trim()
          : `${cap(m.name)}: sudah ada, jumlah tidak berubah`
      );
    });
    Alert.alert('Lemari', lines.join('\n'));
    router.navigate('/fridge');
  };

  const warning =
    result && result.authenticity && result.authenticity !== 'real'
      ? WARNINGS[result.authenticity]
      : null;

  return (
    <View style={styles.container}>
      {uri && <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />}

      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame}>
          {!uri && <Text style={styles.hint}>Ambil foto atau pilih dari galeri</Text>}
        </View>
      </View>

      <Pressable
        style={[styles.back, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Ionicons name="arrow-back" size={36} color="#462b0e" />
      </Pressable>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#462b0e" />
          <Text style={styles.loadingText}>Menganalisis foto...</Text>
        </View>
      )}

      {result && !loading && (
        <View style={[styles.result, { bottom: insets.bottom + 130 }]}>
          <Text style={styles.resultTitle}>Bahan terdeteksi</Text>

          {warning && (
            <View style={styles.warning}>
              <Ionicons name="warning-outline" size={18} color="#b4541a" />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          )}

          {result.ingredients.length === 0 ? (
            <Text style={styles.none}>Tidak ada bahan terdeteksi.</Text>
          ) : (
            <>
              <ScrollView style={styles.chipScroll}>
                <View style={styles.chips}>
                  {result.ingredients.map((name) => {
                    const known = !!findIngredient(name);
                    const on = selected.includes(name);
                    return (
                      <Pressable
                        key={name}
                        onPress={() => toggle(name)}
                        style={[
                          styles.chip,
                          known ? styles.chipKnown : styles.chipUnknown,
                          !on && styles.chipOff,
                        ]}
                      >
                        <Text style={[styles.chipText, !known && styles.chipTextUnknown]}>
                          {name}
                          {known ? '' : ' ?'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              <Text style={styles.legend}>
                Ketuk untuk memilih. Tanda ? berarti bahan belum ada di database, jadi
                tanpa data nutrisi.
              </Text>
              <Pressable
                style={[styles.saveButton, selected.length === 0 && styles.saveDisabled]}
                onPress={saveToFridge}
                disabled={selected.length === 0}
              >
                <Text style={styles.saveText}>
                  {warning ? 'Tetap tambah ke lemari' : 'Tambah ke lemari'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      <View style={[styles.controls, { bottom: insets.bottom + 24 }]}>
        <Pressable style={styles.sideButton} onPress={pickPhoto} disabled={loading}>
          <Ionicons name="image-outline" size={26} color="#462b0e" />
        </Pressable>
        <Pressable style={styles.shutter} onPress={takePhoto} disabled={loading}>
          <Ionicons name="camera-outline" size={40} color="#8a7560" />
        </Pressable>
        <Pressable
          style={styles.sideButton}
          onPress={() => router.push('/add-ingredient')}
          disabled={loading}
        >
          <Ionicons name="add" size={30} color="#462b0e" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ece9e2' },
  frameWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '72%',
    aspectRatio: 0.78,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { color: '#8a7560', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  back: { position: 'absolute', left: 16 },
  loading: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    backgroundColor: '#fff7ebf2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: { color: '#462b0e', fontWeight: '600' },
  result: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff7ebf2',
    borderRadius: 18,
    padding: 14,
  },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#462b0e', marginBottom: 8 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fbe3d2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  warningText: { flex: 1, fontSize: 12, color: '#8a3d10' },
  none: { color: '#605c5a' },
  chipScroll: { maxHeight: 130 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipKnown: { backgroundColor: '#d4e8a2' },
  chipUnknown: { backgroundColor: '#e3e0d8' },
  chipOff: { opacity: 0.35 },
  chipText: { color: '#0c361d', fontWeight: '600' },
  chipTextUnknown: { color: '#605c5a' },
  legend: { fontSize: 11, color: '#605c5a', marginVertical: 8 },
  saveButton: {
    backgroundColor: '#462b0e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fffaf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fffaf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});