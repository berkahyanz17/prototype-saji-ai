import { useEffect, useState } from 'react';
import { Alert as NativeAlert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppMascot } from './AppMascot';
import type { MascotMood } from './Mascot';

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type Options = { mascot?: MascotMood };
type Spec = { title: string; message?: string; buttons: AlertButton[]; options?: Options };

let listener: ((spec: Spec) => void) | null = null;

// Same call shape as React Native's Alert.alert, plus an optional { mascot } 4th argument
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: Options) {
    const spec: Spec = {
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
      options,
    };
    if (listener) listener(spec);
    else NativeAlert.alert(title, message, buttons);
  },
};

export function AlertHost() {
  const [queue, setQueue] = useState<Spec[]>([]);

  useEffect(() => {
    listener = (spec) => setQueue((q) => [...q, spec]);
    return () => {
      listener = null;
    };
  }, []);

  const current = queue[0];
  if (!current) return null;

  const press = (button: AlertButton) => {
    setQueue((q) => q.slice(1));
    button.onPress?.();
  };

  const cancelButton = current.buttons.find((b) => b.style === 'cancel');
  const stacked = current.buttons.length > 2;
  const mood = current.options?.mascot;

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible
      onRequestClose={() => {
        if (cancelButton) press(cancelButton);
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {mood ? (
            <View style={styles.mascot}>
              <AppMascot mood={mood} size={96} />
            </View>
          ) : null}
          <Text style={[styles.title, mood && styles.centered]}>{current.title}</Text>
          {current.message ? (
            <Text style={[styles.message, mood && styles.centered]}>{current.message}</Text>
          ) : null}
          <View style={[styles.buttons, stacked && styles.buttonsStacked]}>
            {current.buttons.map((b, i) => {
              const kind = b.style ?? 'default';
              return (
                <Pressable
                  key={i}
                  onPress={() => press(b)}
                  style={[
                    styles.button,
                    !stacked && styles.buttonFlex,
                    kind === 'cancel' && styles.cancel,
                    kind === 'destructive' && styles.destructive,
                  ]}
                >
                  <Text style={[styles.buttonText, kind === 'cancel' && styles.cancelText]}>
                    {b.text ?? 'OK'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(70,43,14,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#fff7eb',
    borderRadius: 22,
    padding: 20,
    elevation: 8,
  },
  mascot: { alignItems: 'center', marginTop: -4, marginBottom: 6 },
  centered: { textAlign: 'center' },
  title: { fontFamily: 'JosefinSans_700Bold', fontSize: 20, color: '#462b0e' },
  message: {
    fontFamily: 'JosefinSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: '#605c5a',
    marginTop: 8,
  },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  buttonsStacked: { flexDirection: 'column' },
  button: {
    backgroundColor: '#462b0e',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#462b0e',
  },
  buttonFlex: { flex: 1 },
  cancel: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: '#b91c1c', borderColor: '#b91c1c' },
  buttonText: { fontFamily: 'JosefinSans_600SemiBold', fontSize: 15, color: '#fff' },
  cancelText: { color: '#462b0e' },
});