// scripts/test-push.ts
import { sendTestPushToAll } from '../src/lib/sendTestPush';

(async () => {
  try {
    await sendTestPushToAll();
    console.log('Test push notifications sent to all registered devices.');
  } catch (err) {
    console.error('Error sending test push notifications:', err);
    process.exit(1);
  }
})();

// service-account.json
// mama.json
