import { Text, View } from 'react-native';

export const AVATARS = [
  { id: 'telur', emoji: '🥚', bg: '#fbefc8' },
  { id: 'tomat', emoji: '🍅', bg: '#fbd9cf' },
  { id: 'alpukat', emoji: '🥑', bg: '#d4e8a2' },
  { id: 'wortel', emoji: '🥕', bg: '#fbe0c0' },
  { id: 'mie', emoji: '🍜', bg: '#f1dc9a' },
  { id: 'bawang', emoji: '🧅', bg: '#eadcf0' },
  { id: 'cabai', emoji: '🌶️', bg: '#f8cdc8' },
  { id: 'jamur', emoji: '🍄', bg: '#e6dccb' },
];

export const DEFAULT_AVATAR = 'telur';

export function Avatar({ id, size = 64 }: { id: string; size?: number }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: a.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{a.emoji}</Text>
    </View>
  );
}