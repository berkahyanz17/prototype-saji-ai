import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../../lib/FridgeContext';
import { Avatar } from '../../lib/avatars';
import { formatMass, wasteRate } from '../../lib/impact';
import { budgetLabel, equipmentLabel, reminderLabel, timeLabel } from '../../lib/prefs';

const HELP = [
  { label: 'Pusat Bantuan', page: 'help' },
  { label: 'Tentang Saji AI', page: 'about' },
  { label: 'Syarat & Ketentuan', page: 'terms' },
] as const;

const soon = () => Alert.alert('Segera hadir');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
    const {
    favorites,
    cookedDays,
    usedCount,
    cookedRecipeIds,
    prefs,
    impact,
    profile,
    isPlus,
  } = useFridge();

  const streak = cookedDays.filter(Boolean).length;
  const rate = wasteRate(impact);

  const stats = [
    { icon: 'leaf-outline', value: usedCount, label: 'Bahan terpakai' },
    { icon: 'restaurant-outline', value: cookedRecipeIds.length, label: 'Resep dicoba' },
    { icon: 'trash-outline', value: impact.wastedItems, label: 'Bahan terbuang' },
  ] as const;

  const prefRows = [
    { label: 'Preferensi makanan', value: prefs.cuisine, to: '/preferences' },
    { label: 'Batas Waktu Masak', value: timeLabel(prefs.maxMinutes), to: '/preferences' },
    { label: 'Anggaran per Porsi', value: budgetLabel(prefs.budget), to: '/preferences' },
    { label: 'Peralatan memasak', value: equipmentLabel(prefs.equipment), to: '/preferences' },
    { label: 'Pengingat kedaluwarsa', value: reminderLabel(prefs), to: '/settings' },
  ] as const;

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
        <Pressable style={styles.headerSide} onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color="#462b0e" />
        </Pressable>
      </View>

      <Pressable style={styles.profileCard} onPress={() => router.push('/edit-profile')}>
        <Avatar id={profile.avatar} size={84} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Streak {streak} hari</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{favorites.length} favorit</Text>
            </View>
            {isPlus && (
              <View style={[styles.pill, styles.plusPill]}>
                <Text style={styles.pillText}>✦ Saji Plus</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#462b0e" />
      </Pressable>

      <View style={styles.shortcutCard}>
        <Pressable style={styles.shortcut} onPress={() => router.push('/shop')}>
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

      <Text style={styles.section}>Dampak kamu</Text>
      <Pressable style={styles.impactCard} onPress={() => router.push('/impact')}>
        <View style={styles.impactTop}>
          <View>
            <Text style={styles.impactNumber}>{formatMass(impact.usedGrams)}</Text>
            <Text style={styles.impactLabel}>bahan dimanfaatkan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2c311e" />
        </View>
        <View style={styles.impactRow}>
          <View style={styles.impactCell}>
            <Text style={styles.impactCellValue}>{formatMass(impact.rescuedGrams)}</Text>
            <Text style={styles.impactCellLabel}>hampir kedaluwarsa</Text>
          </View>
          <View style={styles.impactCell}>
            <Text style={styles.impactCellValue}>{formatMass(impact.wastedGrams)}</Text>
            <Text style={styles.impactCellLabel}>terbuang</Text>
          </View>
          <View style={styles.impactCell}>
            <Text style={styles.impactCellValue}>{rate === null ? '–' : `${rate}%`}</Text>
            <Text style={styles.impactCellLabel}>waste rate</Text>
          </View>
        </View>
      </Pressable>

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
        <Pressable key={p.label} style={styles.listRow} onPress={() => router.push(p.to)}>
          <Text style={styles.listLabel}>{p.label}</Text>
          <Text style={styles.listValue} numberOfLines={1}>
            {p.value}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#462b0e" />
        </Pressable>
      ))}

      <Text style={styles.section}>Bantuan dan Informasi</Text>
      {HELP.map((h) => (
        <Pressable
          key={h.page}
          style={styles.listRow}
          onPress={() => router.push({ pathname: '/info/[page]', params: { page: h.page } })}
        >
          <Text style={styles.listLabel}>{h.label}</Text>
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
  profileInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#2c311e', marginBottom: 8 },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    backgroundColor: '#ffffffaa',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#2c311e' },
  plusPill: { backgroundColor: '#fbefc8' },
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
  impactCard: {
    backgroundColor: '#abe4c2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  impactTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  impactNumber: { fontSize: 34, fontWeight: '700', color: '#0c361d' },
  impactLabel: { fontSize: 13, color: '#0c351d' },
  impactRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  impactCell: {
    flex: 1,
    backgroundColor: '#ffffff66',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  impactCellValue: { fontSize: 15, fontWeight: '700', color: '#0c361d' },
  impactCellLabel: { fontSize: 10, color: '#0c351d', marginTop: 2 },
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