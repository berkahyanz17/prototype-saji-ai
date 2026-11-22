import type { ComponentProps } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon =
  (on: IconName, off: IconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? on : off} size={size} color={color} />
  );

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#462b0e',
        tabBarInactiveTintColor: '#8a7560',
        tabBarStyle: { backgroundColor: '#fffaf6', borderTopWidth: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Beranda', tabBarIcon: icon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="fridge"
        options={{
          title: 'Lemari',
          tabBarIcon: icon('file-tray-stacked', 'file-tray-stacked-outline'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan', tabBarIcon: icon('scan', 'scan-outline') }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/camera');
          },
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{ title: 'Resep', tabBarIcon: icon('book', 'book-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: icon('person', 'person-outline') }}
      />
    </Tabs>
  );
}