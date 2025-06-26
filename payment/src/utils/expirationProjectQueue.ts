import { Channels, ProjectContract, ProjectContractStatus } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { sendSystemNotification } from '../controllers/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

export const updateAfterFirstPaymentQueue = new Queue<IcontarctQueue>(
  'updateAfterFirstPayment-contract-pending',
  env.redis.queue,
);

updateAfterFirstPaymentQueue.process(async (job) => {
  try {
    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ProjectContractStatus.updateAfterFirstPayment },
      { status: ProjectContractStatus.canceled, actionAt: new Date() },
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
