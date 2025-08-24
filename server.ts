// Minimal Bun API server for saving FCM tokens to Appwrite
import { serve } from "bun";

const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || "";
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || "";
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY || "";
const FCM_COLLECTION_ID = process.env.VITE_APPWRITE_FCM_COLLECTION_ID || "";
const FCM_DATABASE_ID = process.env.VITE_APPWRITE_BLOG_DATABASE_ID || "";

serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/save-fcm-token" && req.method === "POST") {
      try {
        const { userId, token } = await req.json();
        if (!userId || !token) {
          return new Response(JSON.stringify({ error: "Missing userId or token" }), { status: 400 });
        }
        const headers = {
          "X-Appwrite-Project": APPWRITE_PROJECT_ID,
          "X-Appwrite-Key": APPWRITE_API_KEY,
          "Content-Type": "application/json",
        };
        // Upsert: delete old tokens for user, then insert new
        // 1. List existing
        const listRes = await fetch(
          `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents?queries[]=${encodeURIComponent('userId=' + userId)}`,
          { headers }
        );
        const listData = await listRes.json();
        if (listData.documents && listData.documents.length > 0) {
          for (const doc of listData.documents) {
            await fetch(
              `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents/${doc.$id}`,
              { method: "DELETE", headers }
            );
          }
        }
        // 2. Create new
        const createRes = await fetch(
          `${APPWRITE_ENDPOINT}/databases/${FCM_DATABASE_ID}/collections/${FCM_COLLECTION_ID}/documents`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              documentId: "unique()",
              data: { userId, token },
            }),
          }
        );
        if (!createRes.ok) {
          const errText = await createRes.text();
          return new Response(JSON.stringify({ error: errText }), { status: 500 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
      }
    }
    return new Response("Not found", { status: 404 });
  },
});
