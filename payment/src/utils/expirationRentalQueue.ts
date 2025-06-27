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

export const onGoingExpiration = new Queue<{ contractId: string }>(
  'rental_ongoing_expiration',
  env.redis.queue,
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
