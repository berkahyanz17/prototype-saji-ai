import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY_MS } from './foodInfo';
import type { FridgeItem } from './FridgeContext';
import type { Prefs } from './prefs';

const CHANNEL = 'expiry';
const MAX_SCHEDULED = 50;

export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Pengingat kedaluwarsa',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Olah sebelum basi',
      body: 'Telur akan kedaluwarsa besok. Yuk segera dimasak!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL,
    },
  });
}

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const whenText = (days: number) =>
  days <= 0 ? 'hari ini' : days === 1 ? 'besok' : `dalam ${days} hari`;

async function run(fridge: FridgeItem[], prefs: Prefs) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.notify) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const now = Date.now();
  const groups = new Map<string, { at: number; when: string; names: string[] }>();

  for (const item of fridge) {
    if (item.expiresAt <= now) continue;

    // Ideal reminder time: chosen hour, N days before the expiry date
    const ideal = new Date(item.expiresAt);
    ideal.setHours(prefs.notifyHour, 0, 0, 0);
    ideal.setDate(ideal.getDate() - prefs.notifyDaysBefore);
    let at = ideal.getTime();

    // Already passed: remind at the next occurrence of the chosen hour, if still before expiry
    if (at <= now) {
      const next = new Date(now);
      next.setHours(prefs.notifyHour, 0, 0, 0);
      if (next.getTime() <= now) next.setDate(next.getDate() + 1);
      at = next.getTime();
      if (at >= item.expiresAt) continue;
    }

    const days = Math.round((startOfDay(item.expiresAt) - startOfDay(at)) / DAY_MS);
    const when = whenText(days);
    const key = `${at}-${when}`;
    const name = capitalize(item.name);

    const group = groups.get(key);
    if (group) group.names.push(name);
    else groups.set(key, { at, when, names: [name] });
  }

  const upcoming = Array.from(groups.values())
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_SCHEDULED);

  for (const g of upcoming) {
    const list =
      g.names.length <= 3
        ? g.names.join(', ')
        : `${g.names.slice(0, 3).join(', ')} dan ${g.names.length - 3} lainnya`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Olah sebelum basi',
        body: `${list} akan kedaluwarsa ${g.when}. Yuk segera dimasak!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(g.at),
        channelId: CHANNEL,
      },
    });
  }
}

// Runs one reschedule at a time so quick changes don't create duplicates
let queue: Promise<void> = Promise.resolve();

export function scheduleExpiryReminders(fridge: FridgeItem[], prefs: Prefs) {
  queue = queue.then(() => run(fridge, prefs)).catch(() => {});
  return queue;
}