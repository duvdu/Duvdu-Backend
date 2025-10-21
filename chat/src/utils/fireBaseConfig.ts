import * as admin from 'firebase-admin';

import serviceAccount from './fcmKey.json';

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_KEY_JSON as admin.ServiceAccount),
});

export default admin;
