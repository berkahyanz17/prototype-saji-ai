import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useFridge } from './FridgeContext';
import { scheduleExpiryReminders, setupNotifications } from './notifications';

export default function Reminders() {
  const router = useRouter();
  const { fridge, prefs } = useFridge();

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/fridge');
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    scheduleExpiryReminders(fridge, prefs).catch(() => {});
  }, [fridge, prefs]);

  return null;
}