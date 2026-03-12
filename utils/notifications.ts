import { supabase } from '@/utils/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(agentId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('checkin-reminders', {
      name: 'Recordatorios de Check-in',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: require('@/app.json').expo.extra?.eas?.projectId,
  });

  await upsertPushToken(agentId, token);

  return token;
}

async function upsertPushToken(agentId: string, token: string) {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { agent_id: agentId, expo_token: token },
      { onConflict: 'agent_id,expo_token' },
    );

  if (error) console.error('Error saving push token:', error.message);
}

export async function removePushToken(agentId: string) {
  let token: string | undefined;
  try {
    const result = await Notifications.getExpoPushTokenAsync();
    token = result.data;
  } catch {
    return;
  }

  if (!token) return;

  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('agent_id', agentId)
    .eq('expo_token', token);

  if (error) console.error('Error removing push token:', error.message);
}
