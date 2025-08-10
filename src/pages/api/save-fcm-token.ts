// src/pages/api/save-fcm-token.ts
import { saveFcmToken } from '@/lib/fcm';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).json({ error: 'Missing userId or token' });
  try {
    await saveFcmToken(userId, token);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
