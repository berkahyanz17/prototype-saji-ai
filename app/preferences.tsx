import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import {
  CUISINES,
  EQUIPMENT,
  REMIND_DAYS,
  REMIND_HOURS,
  TIME_OPTIONS,
  hourLabel,
} from '../lib/prefs';
import { ensureNotificationPermission, sendTestNotification } from '../lib/notifications';

const timeText = (m: number) => (m > 0 ? `${m} menit` : 'Bebas');

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs } = useFridge();

  const [cuisine, setCuisine] = useState(prefs.cuisine);
  const [maxMinutes, setMaxMinutes] = useState(prefs.maxMinutes);
  const [budgetText, setBudgetText] = useState(prefs.budget ? String(prefs.budget) : '');
  const [equipment, setEquipment] = useState<string[]>(prefs.equipment);
  const [notify, setNotify] = useState(prefs.notify);
  const [daysBefore, setDaysBefore] = useState(prefs.notifyDaysBefore);
  const [hour, setHour] = useState(prefs.notifyHour);

  const equipmentOptions = [...EQUIPMENT, ...equipment.filter((e) => !EQUIPMENT.includes(e))];

  const toggleEquipment = (name: string) =>
    setEquipment((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const toggleNotify = async (value: boolean) => {
    if (value) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        Alert.alert(
          'Izin notifikasi ditolak',
          'Aktifkan notifikasi untuk aplikasi ini di pengaturan HP, lalu coba lagi.'
        );
        return;
      }
    }
    setNotify(value);
  };

  const testNotification = async () => {
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(
        'Izin notifikasi ditolak',
        'Aktifkan notifikasi untuk aplikasi ini di pengaturan HP, lalu coba lagi.'
      );
      return;
    }
    await sendTestNotification();
    Alert.alert('Notifikasi tes', 'Akan muncul dalam 5 detik.');
  };

  const save = () => {
    const digits = budgetText.replace(/\D/g, '');
    setPrefs({
      cuisine,
      maxMinutes,
      budget: digits ? Number(digits) : 0,
      equipment,
      notify,
      notifyDaysBefore: daysBefore,
      notifyHour: hour,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={34} color="#462b0e" />
          </Pressable>
          <Text style={styles.title}>Preferensi</Text>
        </View>

        <Text style={styles.label}>Preferensi makanan</Text>
        <View style={styles.chips}>
          {CUISINES.map((name) => (
            <Pressable
              key={name}
              style={[styles.chip, cuisine === name && styles.chipActive]}
              onPress={() => setCuisine(name)}
            >
              <Text style={[styles.chipText, cuisine === name && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Batas waktu masak</Text>
        <View style={styles.chips}>
          {TIME_OPTIONS.map((m) => (
            <Pressable
              key={m}
              style={[styles.chip, maxMinutes === m && styles.chipActive]}
              onPress={() => setMaxMinutes(m)}
            >
              <Text style={[styles.chipText, maxMinutes === m && styles.chipTextActive]}>
                {timeText(m)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Anggaran per porsi</Text>
        <View style={styles.budgetBox}>
          <Text style={styles.rp}>Rp</Text>
          <TextInput
            style={styles.budgetInput}
            value={budgetText}
            onChangeText={setBudgetText}
            placeholder="Kosongkan jika bebas"
            placeholderTextColor="#9a8c7c"
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.label}>Peralatan memasak</Text>
        <View style={styles.chips}>
          {equipmentOptions.map((name) => (
            <Pressable
              key={name}
              style={[styles.chip, equipment.includes(name) && styles.chipActive]}
              onPress={() => toggleEquipment(name)}
            >
              <Text
                style={[styles.chipText, equipment.includes(name) && styles.chipTextActive]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Pengingat kedaluwarsa</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Ingatkan saat bahan hampir kedaluwarsa</Text>
          <Switch
            value={notify}
            onValueChange={toggleNotify}
            trackColor={{ false: '#e0d6c2', true: '#8f9a6a' }}
            thumbColor="#fff"
          />
        </View>

        {notify && (
          <>
            <Text style={styles.subLabel}>Ingatkan</Text>
            <View style={styles.chips}>
              {REMIND_DAYS.map((d) => (
                <Pressable
                  key={d}
                  style={[styles.chip, daysBefore === d && styles.chipActive]}
                  onPress={() => setDaysBefore(d)}
                >
                  <Text style={[styles.chipText, daysBefore === d && styles.chipTextActive]}>
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
                  style={[styles.chip, hour === h && styles.chipActive]}
                  onPress={() => setHour(h)}
                >
                  <Text style={[styles.chipText, hour === h && styles.chipTextActive]}>
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

        <Text style={styles.note}>
          Resep AI memakai preferensi makanan, waktu, anggaran, dan peralatan. Buat ulang resep
          di tab Resep setelah mengubahnya. Pengingat dijadwalkan ulang otomatis saat
          lemarimu berubah.
        </Text>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Simpan preferensi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  label: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginTop: 20, marginBottom: 10 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#605c5a', marginTop: 14, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: '#8f9a6a', borderColor: '#8f9a6a' },
  chipText: { fontSize: 14, color: '#462b0e' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  rp: { fontSize: 15, fontWeight: '600', color: '#462b0e' },
  budgetInput: { flex: 1, fontSize: 15, color: '#2b2118' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 6,
  },
  switchText: { flex: 1, fontSize: 14, color: '#462b0e', marginRight: 8 },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#462b0e',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 16,
  },
  testText: { fontSize: 14, fontWeight: '600', color: '#462b0e' },
  note: { fontSize: 12, color: '#605c5a', marginTop: 20, lineHeight: 18 },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  saveButton: {
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});