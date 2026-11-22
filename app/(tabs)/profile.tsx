import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { budgetLabel, equipmentLabel, reminderLabel, timeLabel } from '../../lib/prefs';

const USER_NAME = 'User'; // change to your name
const USER_EMAIL = 'user@email.com'; // change to your email

const HELP = ['Pusat Bantuan', 'Tentang Saji AI'];

const soon = () => Alert.alert('Segera hadir');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, favorites, cookedDays, usedCount, cookedRecipeIds, prefs } = useFridge();

  const streak = cookedDays.filter(Boolean).length;
  const spoiled = fridge.filter((i) => i.expiresAt < Date.now()).length;

  const stats = [
    { icon: 'leaf-outline', value: usedCount, label: 'Bahan terpakai' },
    { icon: 'restaurant-outline', value: cookedRecipeIds.length, label: 'Resep dicoba' },
    { icon: 'trash-outline', value: spoiled, label: 'Bahan basi' },
  ] as const;

  const prefRows = [
    { label: 'Preferensi makanan', value: prefs.cuisine },
    { label: 'Batas Waktu Masak', value: timeLabel(prefs.maxMinutes) },
    { label: 'Anggaran per Porsi', value: budgetLabel(prefs.budget) },
    { label: 'Peralatan memasak', value: equipmentLabel(prefs.equipment) },
    { label: 'Pengingat kedaluwarsa', value: reminderLabel(prefs) },
  ];

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
        <View style={styles.headerSide} />
        <Text style={styles.title}>Profil</Text>
        <Pressable style={styles.headerSide} onPress={soon} hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color="#462b0e" />
        </Pressable>
      </View>

      <Pressable style={styles.profileCard} onPress={soon}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={44} color="#8a7560" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{USER_NAME}</Text>
          <Text style={styles.email}>{USER_EMAIL}</Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Streak {streak} hari</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{favorites.length} favorit</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#462b0e" />
      </Pressable>

      <View style={styles.shortcutCard}>
        <Pressable style={styles.shortcut} onPress={soon}>
          <View style={styles.shortcutBox}>
            <Ionicons name="storefront-outline" size={26} color="#462b0e" />
          </View>
          <Text style={styles.shortcutLabel}>Toko</Text>
        </Pressable>
        <Pressable style={styles.shortcut} onPress={soon}>
          <View style={styles.shortcutBox}>
            <Ionicons name="color-palette-outline" size={26} color="#462b0e" />
          </View>
          <Text style={styles.shortcutLabel}>Customisasi</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Ringkasan aktivitas</Text>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <View style={styles.statIcon}>
              <Ionicons name={s.icon} size={20} color="#20392e" />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Pengaturan preferensi</Text>
      {prefRows.map((p) => (
        <Pressable
          key={p.label}
          style={styles.listRow}
          onPress={() => router.push('/preferences')}
        >
          <Text style={styles.listLabel}>{p.label}</Text>
          <Text style={styles.listValue} numberOfLines={1}>
            {p.value}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#462b0e" />
        </Pressable>
      ))}

      <Text style={styles.section}>Bantuan dan Informasi</Text>
      {HELP.map((label) => (
        <Pressable key={label} style={styles.listRow} onPress={soon}>
          <Text style={styles.listLabel}>{label}</Text>
          <View style={styles.spacer} />
          <Ionicons name="chevron-forward" size={18} color="#462b0e" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerSide: { width: 28, alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d0e588',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#2c311e' },
  email: { fontSize: 12, color: '#2c311e', marginBottom: 8 },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    backgroundColor: '#ffffffaa',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#2c311e' },
  shortcutCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#d0e588',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  shortcut: { alignItems: 'center' },
  shortcutBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { fontSize: 11, color: '#2c311e', marginTop: 4 },
  section: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginTop: 6, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#d0e588',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 14, fontWeight: '700', color: '#462b0e' },
  statLabel: { fontSize: 11, color: '#462b0e', marginTop: 2 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  listLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#462b0e' },
  listValue: { fontSize: 11, color: '#605c5a', marginRight: 8, maxWidth: '45%' },
  spacer: { width: 8 },
});