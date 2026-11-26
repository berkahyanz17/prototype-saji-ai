import { Image, Text, View } from 'react-native';

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

export function Avatar({
  id,
  size = 64,
  rings = [],
  photo,
}: {
  id: string;
  size?: number;
  rings?: string[]; // frame colors, outside to inside
  photo?: string;
}) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  const radius = size * 0.3;

  let node = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: a.bg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ fontSize: size * 0.5 }}>{a.emoji}</Text>
      )}
    </View>
  );

  let r = radius;
  for (let i = rings.length - 1; i >= 0; i--) {
    r += 5;
    node = (
      <View
        key={i}
        style={{ borderWidth: 3, borderColor: rings[i], borderRadius: r, padding: 2 }}
      >
        {node}
      </View>
    );
  }
  return node;
}