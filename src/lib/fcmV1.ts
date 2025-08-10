// src/lib/fcmV1.ts
// FCM HTTP v1 API push notification sender using a Google Service Account
import { readFileSync } from 'fs';
import { JWT } from 'google-auth-library';

const serviceAccount = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'service-account.json', 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES,
});

export async function sendPushNotificationV1(token: string, title: string, body: string) {
  await jwtClient.authorize();
  const accessToken = jwtClient.credentials.access_token;
  const projectId = serviceAccount.project_id;

  const message = {
    message: {
      token,
      notification: { title, body }
    }
  };

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FCM v1 error: ${error}`);
  }
}
