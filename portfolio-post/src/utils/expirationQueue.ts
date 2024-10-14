import { Channels } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { sendSystemNotification } from '../controllers/book/sendNotification';
import { ContractStatus, ProjectContract } from '../models/projectContract.model';

interface IcontarctQueue {
  contractId: string;
}

export const pendingQueue = new Queue<IcontarctQueue>('project-contract-pending', env.redis.queue);

export const firstPayMentQueue = new Queue<IcontarctQueue>(
  'firstPayment-contract-pending',
  env.redis.queue,
);

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
    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ContractStatus.pending },
      { status: ContractStatus.canceled, actionAt: new Date() },
      { new: true },
    );

    if (contract) 
      await sendSystemNotification(
        [contract.sp.toString(), contract.customer.toString()],
        contract._id.toString(),
        'contract',
        'project contract updates',
        'project contract canceled by system',
        Channels.update_contract,
      );
    
  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});

firstPayMentQueue.process(async (job) => {
  try {
    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ContractStatus.waitingForFirstPayment },
      { status: ContractStatus.canceled, actionAt: new Date() },
      { new: true },
    );

    if (contract) 
      await sendSystemNotification(
        [contract.sp.toString(), contract.customer.toString()],
        contract._id.toString(),
        'contract',
        'project contract updates',
        'project contract canceled by system',
        Channels.update_contract,
      );

  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});

secondPayMentQueue.process(async (job) => {
  try {
    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ContractStatus.waitingForTotalPayment },
      { status: ContractStatus.canceled, actionAt: new Date() },
    );

    if (contract) 
      await sendSystemNotification(
        [contract.sp.toString(), contract.customer.toString()],
        contract._id.toString(),
        'contract',
        'project contract updates',
        'project contract canceled by system',
        Channels.update_contract,
      );

  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});

updateAfterFirstPaymentQueeu.process(async (job) => {
  try {
    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ContractStatus.updateAfterFirstPayment },
      { status: ContractStatus.canceled, actionAt: new Date() },
    );

    if (contract) 
      await sendSystemNotification(
        [contract.sp.toString(), contract.customer.toString()],
        contract._id.toString(),
        'contract',
        'project contract updates',
        'project contract canceled by system',
        Channels.update_contract,
      );

  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});
