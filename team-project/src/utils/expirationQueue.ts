import { Channels, NotificationDetails, NotificationType } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { sendSystemNotification } from '../controllers/project/sendNotification';
import { ContractStatus, TeamContract } from '../models/teamProject.model';

interface IcontarctQueue {
  contractId: string;
}

export const pendingQueue = new Queue<IcontarctQueue>('project-contract-pending', env.redis.queue);

export const secondPayMentQueue = new Queue<IcontarctQueue>(
  'secondPayment-contract-pending',
  env.redis.queue,
);

export const updateAfterFirstPaymentQueeu = new Queue<IcontarctQueue>(
  'updateAfterFirstPayment-contract-pending',
  env.redis.queue,
);

pendingQueue.process(async (job) => {
  try {
    const contract = await TeamContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ContractStatus.pending },
      { status: ContractStatus.canceled, actionAt: new Date() },
    );

    await sendSystemNotification([contract?.sp!.toString() || '' , contract?.customer!.toString() || ''],
      contract?._id.toString() || '' ,
      NotificationType.update_project_contract ,
      NotificationDetails.updateProjectContract.title,
      NotificationDetails.updateProjectContract.message,
      Channels.update_contract
    );
  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});

