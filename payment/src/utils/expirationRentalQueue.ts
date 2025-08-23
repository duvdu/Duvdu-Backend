import {
  Channels,
  ContractReports,
  RentalContracts,
  RentalContractStatus,
  Roles,
  SystemRoles,
  Users,
  getRedisClient,
} from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers/webhook/sendNotification';

// Create rental queue with async initialization
export const createRentalQueue = async () => {
  const bullRedis = await getRedisClient();

  const onGoingExpiration = new Queue<{ contractId: string }>('rental_ongoing_expiration', {
    connection: bullRedis,
  });

  // Define the worker to process jobs
  new Worker(
    'rental_ongoing_expiration',
    async (job: Job<{ contractId: string }>) => {
      const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

      const contract = await RentalContracts.findOneAndUpdate(
        { _id: job.data.contractId, status: RentalContractStatus.ongoing },
        {
          status: contractComplain
            ? RentalContractStatus.complaint
            : RentalContractStatus.completed,
          actionAt: new Date(),
        },
      );

      if (contractComplain) {
        const role = await Roles.findOne({ key: SystemRoles.admin });
        const admin = await Users.findOne({ role: role?._id });
        if (admin)
          await sendSystemNotification(
            [admin._id.toString()],
            job.data.contractId,
            'contract',
            'project contract complaint',
            'project contract complaint please check it',
            Channels.update_contract,
          );
      } else {
        await sendSystemNotification(
          [contract!.sp.toString(), contract!.customer.toString()],
          job.data.contractId,
          'contract',
          'rental contract completed',
          'rental contract completed please check it',
          Channels.update_contract,
        );

        await Users.findByIdAndUpdate(contract!.sp, {
          $inc: { acceptedProjectsCounter: 1 },
        });
      }
    },
    { connection: bullRedis },
  );

  return { onGoingExpiration };
};

// Initialize and export
let rentalQueue: Awaited<ReturnType<typeof createRentalQueue>>;
createRentalQueue().then((result) => {
  rentalQueue = result;
});

export const getRentalOnGoingExpiration = () => rentalQueue?.onGoingExpiration;
