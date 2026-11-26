import { View, Text, Pressable, Image, StyleSheet } from './ui';
import { nutritionOf } from './ingredients';
import type { Recipe } from './recipes';

type Props = {
  recipe: Recipe;
  readyCount: number;
  total: number;
  label?: string;
  onPress: () => void;
};

export default function RecipeCard({
  recipe,
  readyCount,
  total,
  label = 'Rekomendasi terbaik',
  onPress,
}: Props) {
  const n = nutritionOf(recipe);
  return (
    <Pressable style={[styles.card, recipe.draft && styles.draft]} onPress={onPress}>
      <View style={styles.photo}>
        {recipe.photo ? (
          <Image source={{ uri: recipe.photo }} style={styles.image} />
        ) : (
          <Text style={styles.emoji}>{recipe.emoji}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {recipe.name}
        </Text>
        <Text style={styles.meta}>
          {recipe.minutes > 0 ? `${recipe.minutes} menit` : '– menit'} ·{' '}
          {n.unavailable ? '– kkal' : `${n.calories} kkal`}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {readyCount} dari {total} bahan siap
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fbefc8',
    borderRadius: 19,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 150,
  },
  draft: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#b4541a' },
  photo: {
    width: 120,
    backgroundColor: '#f1dc9a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 60 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', color: '#462b0ecc' },
  name: { fontSize: 20, fontWeight: '700', color: '#462b0e', marginTop: 2 },
  meta: { fontSize: 12, color: '#1e1e1e', marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d4e8a2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '500', color: '#0c361d' },
});