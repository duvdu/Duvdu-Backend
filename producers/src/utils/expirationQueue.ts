import {
  Channels,
  ContractStatus,
  NotificationDetails,
  NotificationType,
  Producer,
  ProducerContract,
} from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { sendSystemNotification } from '../controllers/contract/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

export const createContractQueue = new Queue<IcontarctQueue>(
  'create_contract_Producer',
  env.redis.queue,
);

createContractQueue.process(async (job) => {
  try {
    console.log('expire');

    const contract = await ProducerContract.findById(job.data.contractId);
    const producer = await Producer.findById(contract?.producer);
    if (contract?.status == ContractStatus.pending) {
      await ProducerContract.findByIdAndUpdate(
        job.data.contractId,
        {
          status: ContractStatus.canceled,
          rejectedBy: 'system',
          actionAt: new Date(),
        },
        { new: true },
      );
      await sendSystemNotification(
        [contract.user.toString() || '', producer?.user.toString() || ''],
        contract._id.toString(),
        NotificationType.updated_producer_contract,
        NotificationDetails.updatedProducerContract.title,
        NotificationDetails.updatedProducerContract.message,
        Channels.update_contract,
      );
    }
  } catch (error) {
    return new Error('Failed to cancelled producer contract');
  }
});

export const UpdateContractQueue = new Queue<IcontarctQueue>(
  'update_contract_Producer',
  env.redis.queue,
);

UpdateContractQueue.process(async (job) => {
  try {
    const contract = await ProducerContract.findById(job.data.contractId);
    const producer = await Producer.findById(contract?.producer);

    if (contract?.status == ContractStatus.acceptedWithUpdate) {
      await ProducerContract.findByIdAndUpdate(
        job.data.contractId,
        {
          status: ContractStatus.canceled,
          rejectedBy: 'system',
          actionAt: new Date(),
        },
        { new: true },
      );

      await sendSystemNotification(
        [contract.user.toString() || '', producer?.user.toString() || ''],
        contract._id.toString(),
        NotificationType.updated_producer_contract,
        NotificationDetails.updatedProducerContract.title,
        NotificationDetails.updatedProducerContract.message,
        Channels.update_contract,
      );
    }
  } catch (error) {
    return new Error('Failed to cancelled producer contract');
  }
});
