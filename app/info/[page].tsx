import { View, Text, Pressable, ScrollView, StyleSheet } from '../../lib/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Section = { heading: string; body: string };
type Page = { title: string; note?: string; sections: Section[] };

const PAGES: Record<string, Page> = {
  about: {
    title: 'Tentang Saji AI',
    sections: [
      {
        heading: 'Apa itu Saji AI',
        body: 'Saji AI membantu kamu memasak dari bahan yang sudah ada di rumah dan mengurangi makanan terbuang. Foto bahanmu, simpan di Lemari, lalu dapatkan resep yang sesuai.',
      },
      {
        heading: 'Cara kerja',
        body: 'Foto bahan dikirim ke layanan AI untuk dikenali. Bahan yang cocok dengan database kami mendapat perkiraan masa simpan dan nilai nutrisi. Resep dibuat dari isi Lemari dan preferensimu.',
      },
      {
        heading: 'Perlu diketahui',
        body: 'Masa simpan dan nutrisi adalah perkiraan. Selalu periksa kondisi makanan sebelum dimasak, dan jangan mengandalkan aplikasi ini untuk keputusan kesehatan.',
      },
    ],
  },
  help: {
    title: 'Pusat Bantuan',
    sections: [
      {
        heading: 'Bahan tidak terdeteksi?',
        body: 'Ambil foto dari dekat dengan cahaya cukup. Kamu juga bisa menambah bahan secara manual lewat tombol + di Lemari atau layar Scan.',
      },
      {
        heading: 'Muncul peringatan "layar" atau "cetak"?',
        body: 'Saji AI memberi peringatan jika foto tampak seperti layar atau gambar cetak. Foto bahan asli untuk hasil terbaik.',
      },
      {
        heading: 'Tanggal kedaluwarsa tidak cocok dengan kemasan?',
        body: 'Kedaluwarsa otomatis hanya perkiraan. Isi tanggal di kemasan lewat Tambah Bahan, atau ubah lokasi simpan lewat menu ... di Lemari.',
      },
      {
        heading: 'Jumlah bahan berubah setelah memasak?',
        body: 'Saat menekan Selesai memasak, stok dikurangi sesuai takaran resep. Jumlah bertanda ~ adalah perkiraan; ubah lewat menu ... jika perlu.',
      },
      {
        heading: 'Pengingat tidak muncul?',
        body: 'Aktifkan di Profil > Pengingat kedaluwarsa dan izinkan notifikasi. Pengingat dijadwalkan berdasarkan isi Lemari.',
      },
      {
        heading: 'Data disimpan di mana?',
        body: 'Lemari, favorit, dan preferensi disimpan di perangkatmu. Foto dikirim ke server untuk dianalisis.',
      },
    ],
  },
  terms: {
    title: 'Syarat & Ketentuan',
    note: 'Draf awal. Tinjau dan sesuaikan sebelum rilis publik.',
    sections: [
      {
        heading: '1. Penggunaan',
        body: 'Saji AI disediakan untuk membantu perencanaan memasak pribadi.',
      },
      {
        heading: '2. Bukan nasihat medis atau keamanan pangan',
        body: 'Nilai nutrisi dan masa simpan hanyalah perkiraan. Kamu bertanggung jawab memeriksa keamanan makanan sebelum dikonsumsi, terutama jika punya alergi atau kondisi kesehatan khusus.',
      },
      {
        heading: '3. Hasil AI',
        body: 'Pengenalan bahan dan resep dibuat oleh AI dan bisa keliru. Periksa kembali bahan dan takaran.',
      },
      {
        heading: '4. Data dan foto',
        body: 'Foto yang kamu ambil dikirim ke server Saji AI lalu diteruskan ke Google Gemini untuk dianalisis sesuai ketentuan Google. Jangan mengunggah foto yang berisi data pribadi.',
      },
      {
        heading: '5. Perubahan',
        body: 'Ketentuan ini dapat berubah seiring pengembangan aplikasi.',
      },
    ],
  },
};

export default function InfoScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const data = PAGES[String(page)];
  const version = Constants.expoConfig?.version ?? '1.0.0';

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
          <Text style={styles.title}>{data ? data.title : 'Halaman tidak ditemukan'}</Text>
        </View>

        {data?.note && (
          <View style={styles.note}>
            <Text style={styles.noteText}>{data.note}</Text>
          </View>
        )}

        {data?.sections.map((s) => (
          <View key={s.heading} style={styles.card}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}

        {page === 'about' && <Text style={styles.version}>Versi {version}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#462b0e' },
  note: { backgroundColor: '#fbe3d2', borderRadius: 12, padding: 10, marginBottom: 12 },
  noteText: { fontSize: 12, color: '#8a3d10' },
  card: { backgroundColor: '#fbefc8', borderRadius: 16, padding: 14, marginBottom: 10 },
  heading: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginBottom: 6 },
  body: { fontSize: 14, color: '#1e1e1e', lineHeight: 20 },
  version: { textAlign: 'center', color: '#605c5a', marginTop: 12 },
});