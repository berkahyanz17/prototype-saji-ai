import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { DAY_MS, emojiFor, expiryStatus } from '../lib/foodInfo';
import { formatDateTime } from '../lib/impact';
import { hourLabel } from '../lib/prefs';
import {
  ensureNotificationPermission,
  planReminders,
  sendTestNotification,
} from '../lib/notifications';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fridge, prefs } = useFridge();

  const urgent = fridge
    .filter((i) => i.expiresAt - Date.now() <= 2 * DAY_MS)
    .sort((a, b) => a.expiresAt - b.expiresAt);
  const reminders = planReminders(fridge, prefs);

  const testNotification = async () => {
    if (!(await ensureNotificationPermission())) {
      Alert.alert(
        'Izin notifikasi ditolak',
        'Aktifkan notifikasi untuk aplikasi ini di pengaturan HP, lalu coba lagi.'
      );
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
          <Text style={styles.title}>Notifikasi</Text>
        </View>

        <Pressable style={styles.status} onPress={() => router.push('/settings')}>
          <Ionicons
            name={prefs.notify ? 'notifications' : 'notifications-off-outline'}
            size={22}
            color="#2c311e"
          />
          <Text style={styles.statusText}>
            {prefs.notify
              ? `Pengingat aktif: ${prefs.notifyDaysBefore} hari sebelum, jam ${hourLabel(
                  prefs.notifyHour
                )}`
              : 'Pengingat mati. Ketuk untuk mengaktifkan di Pengaturan.'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#2c311e" />
        </Pressable>

        <Text style={styles.section}>Perlu diolah sekarang</Text>
        {urgent.length === 0 ? (
          <Text style={styles.empty}>Tidak ada bahan yang hampir kedaluwarsa.</Text>
        ) : (
          urgent.map((item) => {
            const status = expiryStatus(item.expiresAt);
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => router.navigate('/fridge')}
              >
                <Text style={styles.emoji}>{emojiFor(item.name, item.category)}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{capitalize(item.name)}</Text>
                  <Text style={styles.cardBody}>{status.text.replace('\n', ' ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#462b0e" />
              </Pressable>
            );
          })
        )}

        <Text style={styles.section}>Pengingat terjadwal</Text>
        {reminders.length === 0 ? (
          <Text style={styles.empty}>
            {prefs.notify
              ? 'Belum ada pengingat. Pengingat muncul saat ada bahan yang akan kedaluwarsa.'
              : 'Aktifkan pengingat di Pengaturan.'}
          </Text>
        ) : (
          reminders.map((r) => (
            <View key={`${r.at}-${r.when}`} style={styles.reminder}>
              <Text style={styles.reminderTime}>{formatDateTime(r.at)}</Text>
              <Text style={styles.cardBody}>{r.body}</Text>
            </View>
          ))
        )}

        <Pressable style={styles.testButton} onPress={testNotification}>
          <Ionicons name="notifications-outline" size={18} color="#462b0e" />
          <Text style={styles.testText}>Kirim notifikasi tes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#d0e588',
    borderRadius: 14,
    padding: 12,
  },
  statusText: { flex: 1, fontSize: 13, color: '#2c311e' },
  section: { fontSize: 17, fontWeight: '700', color: '#462b0e', marginTop: 20, marginBottom: 10 },
  empty: { fontSize: 13, color: '#8a7a68', lineHeight: 19 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefc8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  emoji: { fontSize: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#462b0e' },
  cardBody: { fontSize: 13, color: '#1e1e1e', lineHeight: 19 },
  reminder: { backgroundColor: '#fffaf3', borderRadius: 14, padding: 12, marginBottom: 8 },
  reminderTime: { fontSize: 12, fontWeight: '600', color: '#605c5a', marginBottom: 2 },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 20,
  },
  testText: { fontSize: 14, fontWeight: '600', color: '#462b0e' },
});