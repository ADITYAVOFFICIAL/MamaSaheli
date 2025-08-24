// src/lib/fcm.ts
// Appwrite cloud function handler for saving FCM tokens and sending push notifications

const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const FCM_COLLECTION_ID = process.env.VITE_APPWRITE_FCM_COLLECTION_ID || '';
const FCM_DATABASE_ID = process.env.VITE_APPWRITE_BLOG_DATABASE_ID || '';

const appwriteHeaders = {
  'X-Appwrite-Project': APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': APPWRITE_API_KEY,
  'Content-Type': 'application/json',
};

// Save FCM token for a user

export async function saveFcmToken(userId: string, token: string) {
  // Upsert: delete old tokens for user, then insert new
  // 1. List existing
  const listRes = await fetch(
    `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents?queries[]=${encodeURIComponent('userId=' + userId)}`,
    { headers: appwriteHeaders }
  );
  if (!listRes.ok) throw new Error('Failed to list FCM tokens: ' + (await listRes.text()));
  const listData = await listRes.json();
  if (listData.documents && listData.documents.length > 0) {
    for (const doc of listData.documents) {
      await fetch(
        `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents/${doc.$id}`,
        { method: 'DELETE', headers: appwriteHeaders }
      );
    }
  }
  // 2. Create new
  await fetch(
    `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents`,
    {
      method: 'POST',
      headers: appwriteHeaders,
      body: JSON.stringify({
        documentId: 'unique()',
        data: { userId, token },
      }),
    }
  );
}

// Get all FCM tokens

export async function getAllFcmTokens() {
  const res = await fetch(
    `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents`,
    { headers: appwriteHeaders }
  );
  if (!res.ok) throw new Error('Failed to list FCM tokens: ' + (await res.text()));
  const data = await res.json();
  type FcmDoc = { token: string };
  return (data.documents || []).map((doc: FcmDoc) => doc.token);
}

// Use HTTP v1 API push notification sender
export { sendPushNotificationV1 as sendPushNotification } from './fcmV1';
