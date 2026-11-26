import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const DIR = `${FileSystem.documentDirectory}photos/`;

async function save(uri: string): Promise<string> {
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  const to = `${DIR}${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uri, to });
  return to;
}

// Pick from the gallery with the system crop screen. Returns the saved file or null.
export async function pickPhoto(aspect: [number, number]): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.6,
  });
  if (res.canceled) return null;
  return save(res.assets[0].uri);
}

export async function takePhoto(aspect: [number, number]): Promise<string | null> {
  const { granted } = await ImagePicker.requestCameraPermissionsAsync();
  if (!granted) return null;
  const res = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect,
    quality: 0.6,
  });
  if (res.canceled) return null;
  return save(res.assets[0].uri);
}

// Only deletes files this app saved
export async function deletePhoto(uri?: string) {
  if (uri && uri.startsWith(DIR)) {
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  }
}