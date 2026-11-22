import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from '../lib/ui';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzePhoto } from '../lib/api';
import { useFridge } from '../lib/FridgeContext';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToFridge } = useFridge();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<string[] | null>(null);

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setUri(asset.uri);
    setIngredients(null);
    if (!asset.base64) {
      Alert.alert('Foto gagal dibaca', 'Coba ambil foto lagi.');
      return;
    }
    setLoading(true);
    try {
      const result = await analyzePhoto(asset.base64);
      setIngredients(result.ingredients);
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

  const saveToFridge = () => {
    if (!ingredients || ingredients.length === 0) {
      Alert.alert('Belum ada bahan', 'Ambil atau pilih foto bahan makanan dulu.');
      return;
    }
    const added = addToFridge(ingredients);
    Alert.alert(
      'Lemari',
      added > 0
        ? `${added} bahan ditambahkan ke lemari.`
        : 'Bahan ini sudah ada di lemari.'
    );
    router.navigate('/fridge');
  };

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

      {ingredients && !loading && (
        <View style={[styles.result, { bottom: insets.bottom + 130 }]}>
          <Text style={styles.resultTitle}>Bahan terdeteksi</Text>
          {ingredients.length === 0 ? (
            <Text style={styles.none}>Tidak ada bahan terdeteksi.</Text>
          ) : (
            <>
              <View style={styles.chips}>
                {ingredients.map((name) => (
                  <View key={name} style={styles.chip}>
                    <Text style={styles.chipText}>{name}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.saveButton} onPress={saveToFridge}>
                <Text style={styles.saveText}>Tambah ke lemari</Text>
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
  frameWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
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
  none: { color: '#605c5a' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#d4e8a2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipText: { color: '#0c361d', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#462b0e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
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