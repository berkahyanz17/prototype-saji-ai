import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Alert } from '../lib/ui';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { REMIND_DAYS, REMIND_HOURS, hourLabel } from '../lib/prefs';
import { ensureNotificationPermission, sendTestNotification } from '../lib/notifications';

function Row({
  label,
  value,
  onPress,
  danger,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={danger ? '#b91c1c' : '#462b0e'} />
    </Pressable>
  );
}

const confirm = (title: string, message: string, action: string, onConfirm: () => void) =>
  Alert.alert(title, message, [
    { text: 'Batal', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, clearFridge, resetImpact, resetAll } = useFridge();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const denied = () =>
    Alert.alert(
      'Izin notifikasi ditolak',
      'Aktifkan notifikasi untuk aplikasi ini di pengaturan HP, lalu coba lagi.'
    );

  const toggleNotify = async (value: boolean) => {
    if (value && !(await ensureNotificationPermission())) {
      denied();
      return;
    }
    setPrefs({ ...prefs, notify: value });
  };

  const testNotification = async () => {
    if (!(await ensureNotificationPermission())) {
      denied();
      return;
    }
    await sendTestNotification();
    Alert.alert('Notifikasi tes', 'Akan muncul dalam 5 detik.');
  };

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
          <Text style={styles.title}>Pengaturan</Text>
        </View>

        <Text style={styles.section}>Pengingat</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Ingatkan saat bahan hampir kedaluwarsa</Text>
            <Switch
              value={prefs.notify}
              onValueChange={toggleNotify}
              trackColor={{ false: '#e0d6c2', true: '#8f9a6a' }}
              thumbColor="#fff"
            />
          </View>

          {prefs.notify && (
            <>
              <Text style={styles.subLabel}>Ingatkan</Text>
              <View style={styles.chips}>
                {REMIND_DAYS.map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.chip, prefs.notifyDaysBefore === d && styles.chipActive]}
                    onPress={() => setPrefs({ ...prefs, notifyDaysBefore: d })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        prefs.notifyDaysBefore === d && styles.chipTextActive,
                      ]}
                    >
                      {d} hari sebelum
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.subLabel}>Jam</Text>
              <View style={styles.chips}>
                {REMIND_HOURS.map((h) => (
                  <Pressable
                    key={h}
                    style={[styles.chip, prefs.notifyHour === h && styles.chipActive]}
                    onPress={() => setPrefs({ ...prefs, notifyHour: h })}
                  >
                    <Text
                      style={[styles.chipText, prefs.notifyHour === h && styles.chipTextActive]}
                    >
                      {hourLabel(h)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.testButton} onPress={testNotification}>
                <Ionicons name="notifications-outline" size={18} color="#462b0e" />
                <Text style={styles.testText}>Kirim notifikasi tes</Text>
              </Pressable>
            </>
          )}
        </View>
        <Row label="Lihat notifikasi" onPress={() => router.push('/notifications')} />

        <Text style={styles.section}>Memasak</Text>
        <Row
          label="Preferensi memasak"
          value={prefs.cuisine}
          onPress={() => router.push('/preferences')}
        />

        <Text style={styles.section}>Data</Text>
        <Row
          label="Kosongkan lemari"
          danger
          onPress={() =>
            confirm(
              'Kosongkan lemari?',
              'Semua bahan di lemari akan dihapus. Statistik dampak tidak berubah.',
              'Kosongkan',
              clearFridge
            )
          }
        />
        <Row
          label="Reset statistik dampak"
          danger
          onPress={() =>
            confirm(
              'Reset statistik dampak?',
              'Semua angka dampak dihitung ulang dari nol.',
              'Reset',
              resetImpact
            )
          }
        />
        <Row
          label="Reset semua data"
          danger
          onPress={() =>
            confirm(
              'Reset semua data?',
              'Lemari, favorit, preferensi, profil, dan statistik akan dihapus dari perangkat ini.',
              'Reset semua',
              resetAll
            )
          }
        />

        <Text style={styles.section}>Informasi</Text>
        <Row
          label="Pusat Bantuan"
          onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'help' } })}
        />
        <Row
          label="Tentang Saji AI"
          onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'about' } })}
        />
        <Row
          label="Syarat & Ketentuan"
          onPress={() => router.push({ pathname: '/info/[page]', params: { page: 'terms' } })}
        />
        <Text style={styles.version}>Saji AI · versi {version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  section: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginTop: 18, marginBottom: 10 },
  card: { backgroundColor: '#fffaf3', borderRadius: 14, padding: 12, marginBottom: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchText: { flex: 1, fontSize: 14, color: '#462b0e', marginRight: 8 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#605c5a', marginTop: 14, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#fff7eb',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: '#8f9a6a', borderColor: '#8f9a6a' },
  chipText: { fontSize: 13, color: '#462b0e' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  testText: { fontSize: 14, fontWeight: '600', color: '#462b0e' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#462b0e' },
  rowValue: { fontSize: 12, color: '#605c5a', marginRight: 8, maxWidth: '45%' },
  danger: { color: '#b91c1c' },
  version: { textAlign: 'center', color: '#8a7a68', fontSize: 12, marginTop: 20 },
});