import admin from './fireBaseConfig';

export const sendFcmToMultipleUsers = async (tokens: string[], title: string, message: string) => {
  const messagePayload = {
    notification: {
      title: title,
      body: message,
    },
    tokens: tokens,
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().sendMulticast(messagePayload);
    console.log('Successfully sent FCM notification to multiple users:', response);
  } catch (error) {
    console.error('Error sending FCM notification to multiple users:', error);
  }
};
