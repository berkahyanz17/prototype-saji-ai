import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
  type TextProps,
} from 'react-native';

export {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

const FAMILIES = {
  400: 'JosefinSans_400Regular',
  500: 'JosefinSans_500Medium',
  600: 'JosefinSans_600SemiBold',
  700: 'JosefinSans_700Bold',
} as const;

function familyFor(weight: unknown) {
  const raw =
    weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight);
  const w = Number.isFinite(raw) ? raw : 400;
  if (w <= 400) return FAMILIES[400];
  if (w <= 500) return FAMILIES[500];
  if (w <= 600) return FAMILIES[600];
  return FAMILIES[700];
}

export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <RNText
      {...props}
      style={[style, { fontFamily: familyFor(flat.fontWeight), fontWeight: 'normal' }]}
    />
  );
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={[style, { fontFamily: FAMILIES[500] }]} />;
}