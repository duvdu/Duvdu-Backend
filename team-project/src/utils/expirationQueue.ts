import { Channels, TeamContract, TeamContractStatus, UserStatus } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { updateUserStatus } from '../controllers/contract/updateUserStatus';
import { sendSystemNotification } from '../controllers/project/sendNotification';

interface IcontarctQueue {
  contractId: string;
  lang: string;
}

export const pendingQueue = new Queue<IcontarctQueue>('team-contract-pending', env.redis.queue);

export const PayMentQueue = new Queue<IcontarctQueue>(
  'secondPayment-contract-pending',
  env.redis.queue,
);

pendingQueue.process(async (job) => {
  try {
    const contract = await TeamContract.findOneAndUpdate(
      { _id: job.data.contractId, status: TeamContractStatus.pending },
      { status: TeamContractStatus.canceled, actionAt: new Date() },
      { new: true },
    );

    if (contract) {
      await updateUserStatus(
        contract.project.toString(),
        contract.category.toString(),
        contract.sp.toString(),
        UserStatus.canceled,
        job.data.lang,
      );
      await sendSystemNotification(
        [contract?.sp!.toString(), contract?.customer!.toString()],
        contract?._id.toString(),
        'contract',
        'rental contract updates ',
        'contract canceled by system',
        Channels.update_contract,
      );
    }
  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});

PayMentQueue.process(async (job) => {
  try {
    const contract = await TeamContract.findOneAndUpdate(
      { _id: job.data.contractId, status: TeamContractStatus.waitingForTotalPayment },
      { status: TeamContractStatus.canceled, actionAt: new Date() },
      { new: true },
    );

    if (contract) {
      await updateUserStatus(
        contract!.project.toString(),
        contract!.category.toString(),
        contract!.sp.toString(),
        UserStatus.canceled,
        job.data.lang,
      );
      await sendSystemNotification(
        [contract?.sp!.toString(), contract?.customer!.toString()],
        contract?._id.toString(),
        'contract',
        'rental contract updates ',
        'contract canceled by system',
        Channels.update_contract,
      );
    }
  } catch (error) {
    return new Error('Failed to cancelled project contract');
  }
});
