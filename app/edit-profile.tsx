import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { AVATARS, Avatar } from '../lib/avatars';

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useFridge();
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nama kosong', 'Isi namamu dulu.');
      return;
    }
    setProfile({ name: trimmed.slice(0, 24), avatar });
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
          <Text style={styles.title}>Ubah profil</Text>
        </View>

        <View style={styles.preview}>
          <Avatar id={avatar} size={96} />
        </View>

        <Text style={styles.label}>Pilih avatar</Text>
        <View style={styles.grid}>
          {AVATARS.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setAvatar(a.id)}
              style={[styles.avatarBox, avatar === a.id && styles.avatarActive]}
            >
              <Avatar id={a.id} size={56} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={24}
          placeholder="Namamu"
          placeholderTextColor="#9a8c7c"
        />
        <Text style={styles.counter}>{name.length}/24</Text>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Simpan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  preview: { alignItems: 'center', marginVertical: 18 },
  label: { fontSize: 15, fontWeight: '700', color: '#462b0e', marginTop: 12, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avatarBox: { padding: 4, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  avatarActive: { borderColor: '#462b0e' },
  input: {
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    color: '#2b2118',
  },
  counter: { fontSize: 11, color: '#8a7a68', textAlign: 'right', marginTop: 4 },
  bottom: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff7eb' },
  saveButton: {
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});