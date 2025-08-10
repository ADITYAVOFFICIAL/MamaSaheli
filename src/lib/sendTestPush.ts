// src/lib/sendTestPush.ts
import { getAllFcmTokens, sendPushNotification } from './fcm';

export async function sendTestPushToAll() {
  const tokens = await getAllFcmTokens();
  for (const token of tokens) {
    await sendPushNotification(token, 'Test Notification', 'This is a test push from MamaSaheli!');
    console.log(`Sent test notification to token: ${token}`);
  }
}

// To run: import and call sendTestPushToAll() from a script or Appwrite function
