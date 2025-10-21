import * as admin from 'firebase-admin';

import serviceAccount from './fcmToken.json';
let initialized = false;

const initializeFirebase = () => {
  if (initialized || admin.apps.length > 0) {
    return admin;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    initialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error(
      'Firebase service account file not found. Please ensure serviceAccount.json exists in the services directory.',
    );
    console.error('Error details:', error);
    throw new Error('Firebase configuration failed: serviceAccount.json not found');
  }

  return admin;
};

// Export a function to get initialized admin instance
export const getFirebaseAdmin = () => {
  return initializeFirebase();
};
