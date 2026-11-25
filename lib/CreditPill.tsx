import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from './ui';
import { useFridge } from './FridgeContext';
import { FREE_DAILY } from './plan';

export function CreditPill() {
  const router = useRouter();
  const { isPlus, creditsLeft } = useFridge();

  return (
    <Pressable
      onPress={() => router.push('/shop')}
      style={[styles.pill, isPlus && styles.plus]}
      hitSlop={8}
    >
      <Text style={[styles.text, isPlus && styles.plusText]}>
        {isPlus ? '✦ Plus' : `⚡ ${creditsLeft}/${FREE_DAILY}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: '#e8dcc6',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  plus: { backgroundColor: '#20392e', borderColor: '#20392e' },
  text: { fontSize: 12, fontWeight: '700', color: '#462b0e' },
  plusText: { color: '#d0e588' },
});