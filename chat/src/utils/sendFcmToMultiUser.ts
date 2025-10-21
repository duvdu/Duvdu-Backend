import { getFirebaseAdmin } from './fireBaseConfig';

interface FCMResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    messageId?: string;
    error?: any;
  }>;
}

export const sendFcmToMultipleUsers = async (
  tokens: string[],
  title: string,
  message: string,
): Promise<FCMResponse | null> => {
  // Validate input parameters
  if (!tokens || tokens.length === 0) {
    console.warn('No FCM tokens provided');
    return null;
  }

  if (!title || !message) {
    console.warn('Title and message are required for FCM notification');
    return null;
  }

  // Filter out invalid tokens
  const validTokens = tokens.filter(
    (token) => token && typeof token === 'string' && token.trim().length > 0,
  );

  if (validTokens.length === 0) {
    console.warn('No valid FCM tokens found');
    return null;
  }

  // Firebase has a limit of 500 tokens per batch
  const batchSize = 500;
  const results: FCMResponse = {
    successCount: 0,
    failureCount: 0,
    results: [],
  };

  try {
    // Process tokens in batches
    for (let i = 0; i < validTokens.length; i += batchSize) {
      const tokenBatch = validTokens.slice(i, i + batchSize);

      const messagePayload = {
        notification: {
          title: title,
          body: message,
        },
        tokens: tokenBatch,
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
        android: {
          notification: {
            channelId: 'default',
            sound: 'default',
          },
        },
      };

      console.log(
        `Sending FCM notification batch ${Math.floor(i / batchSize) + 1} to ${tokenBatch.length} tokens`,
      );

      try {
        const admin = getFirebaseAdmin();
        const response = await admin.messaging().sendMulticast(messagePayload);

        results.successCount += response.successCount;
        results.failureCount += response.failureCount;
        results.results.push(
          ...response.responses.map((resp) => ({
            messageId: resp.messageId,
            error: resp.error,
          })),
        );

        console.log(
          `Batch ${Math.floor(i / batchSize) + 1} - Success: ${response.successCount}, Failures: ${response.failureCount}`,
        );

        // Log individual failures for debugging
        if (response.failureCount > 0) {
          response.responses.forEach((resp, index) => {
            if (resp.error) {
              console.error(`Token ${index} failed:`, {
                token: tokenBatch[index],
                error: resp.error.code,
                message: resp.error.message,
              });
            }
          });
        }
      } catch (batchError: any) {
        console.error(`Error sending FCM batch ${Math.floor(i / batchSize) + 1}:`, {
          error: batchError.message,
          code: batchError.code,
          details: batchError.details,
          stack: batchError.stack,
        });

        // Check if it's an authentication error
        if (
          batchError.code === 'app/invalid-credential' ||
          batchError.code === 'messaging/authentication-error'
        ) {
          console.error(
            'Firebase authentication failed. Please check your service account configuration.',
          );
        }

        results.failureCount += tokenBatch.length;
      }
    }

    console.log(
      `FCM notification completed - Total Success: ${results.successCount}, Total Failures: ${results.failureCount}`,
    );
    return results;
  } catch (error: any) {
    console.error('Critical error in FCM notification service:', {
      error: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      tokenCount: validTokens.length,
    });

    // Check for specific error types
    if (error.message && error.message.includes('<!DOCTYPE html>')) {
      console.error(
        'Received HTML response instead of JSON - this indicates an authentication or network issue',
      );
      console.error('Possible causes:');
      console.error('1. Invalid Firebase service account credentials');
      console.error('2. Network/proxy blocking Firebase API requests');
      console.error('3. Firebase project configuration issues');
      console.error('4. Expired or revoked service account key');
    }

    throw error;
  }
};
