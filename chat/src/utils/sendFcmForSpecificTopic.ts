import { getFirebaseAdmin } from './fireBaseConfig';

export const sendFcmToSpecificTopic = async (topic: string, title: string, message: string) => {
  const messagePayload = {
    notification: {
      title: title,
      body: message,
    },
    topic: topic,
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const admin = getFirebaseAdmin();
    const response = await admin.messaging().send(messagePayload);
    console.log('Successfully sent FCM notification:', response);
  } catch (error) {
    console.error('Error sending FCM notification:', error);
  }
};
