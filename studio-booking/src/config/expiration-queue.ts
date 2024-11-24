import { Channels, ContractReports , RentalContracts , RentalContractStatus} from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from './env';
import { sendSystemNotification } from '../controllers/booking/contract-notification.controller';

export const pendingExpiration = new Queue<{ contractId: string }>(
  'rental_pending_expiration',
  env.redis.queue,
);

export const paymentExpiration = new Queue<{ contractId: string }>(
  'rental_payment_expiration',
  env.redis.queue,
);

export const onGoingExpiration = new Queue<{ contractId: string }>(
  'rental_ongoing_expiration',
  env.redis.queue,
);

pendingExpiration.process(async (job) => {
  const contract =await RentalContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: RentalContractStatus.pending },
    { status: RentalContractStatus.canceled, actionAt: new Date() },
  );

  if (contract)
    await sendSystemNotification(
      [contract.sp.toString(), contract.customer.toString()],
      contract._id.toString(),
      'contract',
      'rental contract updates',
      'contract canceled by system',
      Channels.update_contract,
    );

});

paymentExpiration.process(async (job) => {
  const contract = await RentalContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: RentalContractStatus.waitingForPayment },
    { status: RentalContractStatus.canceled, actionAt: new Date() },
  );

  if (contract)
    await sendSystemNotification(
      [contract.sp.toString(), contract.customer.toString()],
      contract._id.toString(),
      'contract',
      'rental contract updates',
      'contract canceled by system',
      Channels.update_contract,
    );

});

onGoingExpiration.process(async (job) => {
  const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

  await RentalContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: RentalContractStatus.ongoing },
    {
      status: contractComplain ? RentalContractStatus.complaint : RentalContractStatus.completed,
      actionAt: new Date(),
    },
  );

  if (contractComplain) {
    // send notification for admin
  } else {
    // send total amount to sp & save transaction
  }
});
