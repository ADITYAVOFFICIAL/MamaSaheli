// src/lib/fcm.ts
// Appwrite cloud function handler for saving FCM tokens and sending push notifications
import { Client, Databases, ID } from 'appwrite';

const client = new Client();
client
  .setEndpoint(process.env.VITE_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.VITE_PUBLIC_APPWRITE_PROJECT_ID || '');

const databases = new Databases(client);
const FCM_COLLECTION_ID = process.env.VITE_PUBLIC_APPWRITE_FCM_COLLECTION_ID || '';
const FCM_DATABASE_ID = process.env.VITE_PUBLIC_APPWRITE_BLOG_DATABASE_ID || '';

// Save FCM token for a user
export async function saveFcmToken(userId: string, token: string) {
  // Upsert logic: delete old, insert new
  const existing = await databases.listDocuments(FCM_DATABASE_ID, FCM_COLLECTION_ID, [
    `userId=${userId}`
  ]);
  if (existing.documents.length > 0) {
    for (const doc of existing.documents) {
      await databases.deleteDocument(FCM_DATABASE_ID, FCM_COLLECTION_ID, doc.$id);
    }
  }
  await databases.createDocument(FCM_DATABASE_ID, FCM_COLLECTION_ID, ID.unique(), {
    userId,
    token
  });
}

// Get all FCM tokens
export async function getAllFcmTokens() {
  const docs = await databases.listDocuments(FCM_DATABASE_ID, FCM_COLLECTION_ID);
  return docs.documents.map(doc => doc.token);
}

// Use HTTP v1 API push notification sender
export { sendPushNotificationV1 as sendPushNotification } from './fcmV1';
