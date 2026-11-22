import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import '../lib/ignoreLogs';
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  JosefinSans_700Bold,
} from '@expo-google-fonts/josefin-sans';
import { FridgeProvider } from '../lib/FridgeContext';
import Reminders from '../lib/Reminders';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    JosefinSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <FridgeProvider>
      <Reminders />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="nutrition/[id]" />
      </Stack>
      <StatusBar style="dark" />
    </FridgeProvider>
  );
}