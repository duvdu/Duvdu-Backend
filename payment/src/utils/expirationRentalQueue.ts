import {
  Channels,
  ContractReports,
  RentalContracts,
  RentalContractStatus,
  Roles,
  SystemRoles,
  Users,
} from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';
import { sendSystemNotification } from '../controllers/sendNotification';




// Configure Redis connection options to handle connection issues
const redisOptions = {
  redis: {
    host: env.redis.uri.split('://')[1].split(':')[0],
    port: parseInt(env.redis.uri.split(':').pop() || '6379'),
    password: env.redis.pass,
    // Limit connection attempts to prevent "max clients reached" error
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    // Set a lower reconnect strategy
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.error('Redis connection failed too many times. Not retrying.');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000); // Increase delay between retries
    }
  }
};



export const onGoingExpiration = new Queue<{ contractId: string }>(
  'rental_ongoing_expiration',
  env.redis.queue,
  redisOptions
);

onGoingExpiration.process(async (job) => {
  const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

  const contract = await RentalContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: RentalContractStatus.ongoing },
    {
      status: contractComplain ? RentalContractStatus.complaint : RentalContractStatus.completed,
      actionAt: new Date(),
    },
  );

  if (contractComplain) {
    // send notification for admin
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
  }
});
