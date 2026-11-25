import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from './ui';

export default function AdCard() {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <Text style={styles.tag}>Iklan (placeholder)</Text>
      <Text style={styles.title}>Ruang iklan native</Text>
      <Text style={styles.body}>Iklan Google AdMob akan tampil di sini setelah terhubung.</Text>
      <Pressable onPress={() => router.push('/shop')} hitSlop={8}>
        <Text style={styles.link}>Hilangkan iklan dengan Saji Plus</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d9c9a8',
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },
  tag: { fontSize: 11, fontWeight: '700', color: '#8a7a68' },
  title: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginTop: 4 },
  body: { fontSize: 13, color: '#605c5a', marginTop: 2, marginBottom: 8 },
  link: { fontSize: 13, fontWeight: '700', color: '#20392e' },
});