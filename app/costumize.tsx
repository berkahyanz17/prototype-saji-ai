import { useState, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from '../lib/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFridge } from '../lib/FridgeContext';
import { useCosmetics } from '../lib/CosmeticsContext';
import { Avatar } from '../lib/avatars';
import { Mascot } from '../lib/Mascot';
import { BACKGROUNDS, FRAMES, SKINS, effectiveCosmetics, type Cosmetics } from '../lib/cosmetics';

type Tab = keyof Cosmetics;

const TABS: { id: Tab; label: string }[] = [
  { id: 'skin', label: 'Skin maskot' },
  { id: 'frame', label: 'Bingkai' },
  { id: 'background', label: 'Latar' },
];

function Cell({
  selected,
  locked,
  name,
  onPress,
  children,
}: {
  selected: boolean;
  locked: boolean;
  name: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable style={[styles.cell, selected && styles.cellActive]} onPress={onPress}>
      <View style={styles.cellBody}>{children}</View>
      <Text style={styles.cellName}>{name}</Text>
      {locked && (
        <View style={styles.lock}>
          <Ionicons name="lock-closed" size={12} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

export default function CustomizeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPlus, profile } = useFridge();
  const { cosmetics, setCosmetics, profilePhoto } = useCosmetics();
  const look = effectiveCosmetics(cosmetics, isPlus);
  const [tab, setTab] = useState<Tab>('skin');

  const choose = (kind: Tab, id: string, plus: boolean) => {
    if (plus && !isPlus) {
      Alert.alert('Khusus Saji Plus', 'Item ini terbuka untuk pelanggan Saji Plus.', [
        { text: 'Nanti', style: 'cancel' },
        { text: 'Lihat Toko', onPress: () => router.push('/shop') },
      ]);
      return;
    }
    setCosmetics({ ...cosmetics, [kind]: id });
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
          <Text style={styles.title}>Kustomisasi</Text>
        </View>

        <View style={[styles.preview, { backgroundColor: look.background.color }]}>
          <Avatar
            id={profile.avatar}
            size={72}
            rings={look.frame.rings}
            photo={profilePhoto}
          />
          <Text style={styles.previewName}>{profile.name}</Text>
          <Mascot mood="masak" skin={look.skin.id} size={110} />
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.tab, tab === t.id && styles.tabActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {tab === 'skin' &&
            SKINS.map((s) => (
              <Cell
                key={s.id}
                name={s.name}
                selected={look.skin.id === s.id}
                locked={s.plus && !isPlus}
                onPress={() => choose('skin', s.id, s.plus)}
              >
                <Mascot mood="senang" skin={s.id} size={84} />
              </Cell>
            ))}
          {tab === 'frame' &&
            FRAMES.map((f) => (
              <Cell
                key={f.id}
                name={f.name}
                selected={look.frame.id === f.id}
                locked={f.plus && !isPlus}
                onPress={() => choose('frame', f.id, f.plus)}
              >
                <Avatar id={profile.avatar} size={52} rings={f.rings} photo={profilePhoto} />
              </Cell>
            ))}
          {tab === 'background' &&
            BACKGROUNDS.map((b) => (
              <Cell
                key={b.id}
                name={b.name}
                selected={look.background.id === b.id}
                locked={b.plus && !isPlus}
                onPress={() => choose('background', b.id, b.plus)}
              >
                <View style={[styles.swatch, { backgroundColor: b.color }]} />
              </Cell>
            ))}
        </View>

        {!isPlus && (
          <Pressable style={styles.plusBanner} onPress={() => router.push('/shop')}>
            <Text style={styles.plusText}>✦ Buka semua item dengan Saji Plus</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '700', color: '#462b0e' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  previewName: { flex: 1, fontSize: 18, fontWeight: '700', color: '#2c311e', marginLeft: 12 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#e7e7e7',
  },
  tabActive: { backgroundColor: '#8f9a6a' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#444' },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '31%',
    backgroundColor: '#fffaf3',
    borderWidth: 2,
    borderColor: '#e8dcc6',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cellActive: { borderColor: '#462b0e', backgroundColor: '#fbefc8' },
  cellBody: { height: 96, alignItems: 'center', justifyContent: 'center' },
  cellName: { fontSize: 12, fontWeight: '600', color: '#462b0e', marginTop: 4 },
  lock: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#462b0e',
    borderRadius: 10,
    padding: 4,
  },
  swatch: { width: 64, height: 64, borderRadius: 18, borderWidth: 1, borderColor: '#e8dcc6' },
  plusBanner: {
    backgroundColor: '#20392e',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  plusText: { color: '#d0e588', fontWeight: '700', fontSize: 14 },
});