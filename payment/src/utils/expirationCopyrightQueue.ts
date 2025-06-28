import {
  Channels,
  ContractReports,
  CopyrightContracts,
  CopyrightContractStatus,
  getRedisClient,
  Roles,
  SystemRoles,
  Users,
} from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers';

interface IContractQueue {
  contractId: string;
}

// Create queues with async initialization
export const createCopyrightQueues = async () => {
  const bullRedis = await getRedisClient();

  const updateAfterFirstPaymentExpiration = new Queue<IContractQueue>(
    'copyright_update_after_first_payment_expiration',
    {
      connection: bullRedis,
    },
  );

  const onGoingExpiration = new Queue<IContractQueue>('copyright_ongoing_expiration', {
    connection: bullRedis,
  });

  new Worker(
    'copyright_update_after_first_payment_expiration',
    async (job: Job<IContractQueue>) => {
      try {
        const contract = await CopyrightContracts.findOneAndUpdate(
          { _id: job.data.contractId, status: CopyrightContractStatus.updateAfterFirstPayment },
          { status: CopyrightContractStatus.canceled, actionAt: new Date() },
          { new: true },
        );

        if (contract)
          await sendSystemNotification(
            [contract.sp.toString(), contract.customer.toString()],
            contract._id.toString(),
            'contract',
            'copyright contract updates',
            'contract canceled by system',
            Channels.update_contract,
          );
      } catch (error) {
        throw new Error('Failed to cancel copyright contract');
      }
    },
    { connection: bullRedis },
  );

  new Worker(
    'copyright_ongoing_expiration',
    async (job: Job<IContractQueue>) => {
      try {
        // after submit by 24 hour
        const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

        const contract = await CopyrightContracts.findOneAndUpdate(
          { _id: job.data.contractId, status: CopyrightContractStatus.ongoing },
          {
            status: contractComplain
              ? CopyrightContractStatus.complaint
              : CopyrightContractStatus.completed,
            actionAt: new Date(),
          },
        );

        if (contractComplain) {
          const role = await Roles.findOne({ key: SystemRoles.admin });
          const users = await Users.findOne({ role: role?._id });
          if (users) {
            await sendSystemNotification(
              [users.id.toString()],
              job.data.contractId,
              'contract',
              'copyright contract updates',
              'contract complaint',
              Channels.notification,
            );
          }
        } else {
          await sendSystemNotification(
            [contract!.sp.toString(), contract!.customer.toString()],
            job.data.contractId,
            'contract',
            'copyright contract updates',
            'contract completed',
            Channels.notification,
          );
        }
      } catch (error) {
        throw new Error('Failed to process ongoing copyright contract expiration');
      }
    },
    { connection: bullRedis },
  );

  return {
    updateAfterFirstPaymentExpiration,
    onGoingExpiration,
  };
};

// Initialize and export
let copyrightQueues: Awaited<ReturnType<typeof createCopyrightQueues>>;
createCopyrightQueues().then((result) => {
  copyrightQueues = result;
});

export const getUpdateAfterFirstPaymentExpirationQueue = () =>
  copyrightQueues?.updateAfterFirstPaymentExpiration;
export const getOnGoingExpirationQueue = () => copyrightQueues?.onGoingExpiration;
