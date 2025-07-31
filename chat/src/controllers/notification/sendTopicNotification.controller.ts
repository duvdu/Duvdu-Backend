import 'express-async-errors';

import { Notification, Users } from '@duvdu-v1/duvdu';

import { SendNotificationForSpecificTopicHandler } from '../../types/endpoints/notification.endpoint';
import { sendFCMNotification } from '../../utils/sendNotificationOrFcm';

export const sendTopicNotificationHandler: SendNotificationForSpecificTopicHandler = async (
  req,
  res,
) => {
  try {
    // Fetch users with minimal required fields for better performance
    const users = await Users.find(
      { isDeleted: false, 'isBlocked.value': false },
      { _id: 1, fcmTokens: 1 }
    ).lean(); // Use lean() for better performance

    if (users.length === 0) {
      return res.status(200).json({ 
        message: 'success'
      });
    }

    // Extract FCM tokens more efficiently
    const notificationTokens: string[] = [];
    const userIds: string[] = [];
    
    for (const user of users) {
      userIds.push(user._id.toString());
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        for (const tokenObj of user.fcmTokens) {
          if (tokenObj.fcmToken) {
            notificationTokens.push(tokenObj.fcmToken);
          }
        }
      }
    }

    // Prepare notification documents for bulk insert
    const notificationDocuments = userIds.map(userId => ({
      title: req.body.title,
      message: req.body.message,
      target: userId,
      sourceUser: req.loggedUser?.id,
      targetUser: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Bulk insert notifications for better performance
    const insertedNotifications = await Notification.insertMany(notificationDocuments, {
      ordered: false, // Allow partial success if some documents fail
      rawResult: true
    });

    // Get a sample notification for FCM (use first inserted notification)
    const sampleNotification = insertedNotifications.insertedIds?.[0] 
      ? await Notification.findById(insertedNotifications.insertedIds[0]).populate({
        path: 'targetUser',
        select: 'name username'
      }).lean()
      : null;

    // Send FCM notifications if tokens exist
    if (notificationTokens.length > 0) {
      // Process FCM in batches to avoid overwhelming the service
      const batchSize = 500; // FCM supports up to 500 tokens per request
      const tokenBatches = [];
      
      for (let i = 0; i < notificationTokens.length; i += batchSize) {
        tokenBatches.push(notificationTokens.slice(i, i + batchSize));
      }

      // Send FCM notifications in parallel batches
      const fcmPromises = tokenBatches.map(tokenBatch => 
        sendFCMNotification(
          tokenBatch,
          req.body.title,
          req.body.message,
          sampleNotification!
        ).catch(error => {
          console.error('FCM batch failed:', error);
          return null; // Don't fail the entire operation if one batch fails
        })
      );

      await Promise.allSettled(fcmPromises);
    }

    res.status(200).json({ 
      message: 'success'
    });

  } catch (error) {
    console.error('Topic notification error:', error);
    res.status(500).json(<any>{ 
      message: 'failed to send topic notification',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
