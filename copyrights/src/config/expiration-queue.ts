import { Channels, ContractReports, CopyrightContracts  , CopyrightContractStatus} from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from './env';
import { sendSystemNotification } from '../controllers/booking/contract-notification.controller';

export const pendingExpiration = new Queue<{ contractId: string }>(
  'copyright_pending_expiration',
  env.redis.queue,
);

export const firstPaymentExpiration = new Queue<{ contractId: string }>(
  'copyright_first_payment_expiration',
  env.redis.queue,
);

export const updateAfterFirstPaymentExpiration = new Queue<{ contractId: string }>(
  'copyright_update_after_first_payment_expiration',
  env.redis.queue,
);

export const totalPaymentExpiration = new Queue<{ contractId: string }>(
  'copyright_total_payment_expiration',
  env.redis.queue,
);

export const onGoingExpiration = new Queue<{ contractId: string }>(
  'copyright_ongoing_expiration',
  env.redis.queue,
);

pendingExpiration.process(async (job) => {
  const contract = await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: CopyrightContractStatus.pending },
    { status: CopyrightContractStatus.canceled, actionAt: new Date() },
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
});

firstPaymentExpiration.process(async (job) => {
  const contract = await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: CopyrightContractStatus.waitingForFirstPayment },
    { status: CopyrightContractStatus.canceled, actionAt: new Date() },
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

});

updateAfterFirstPaymentExpiration.process(async (job) => {
  // if there are no update status will be wait for the total payment (act as sp reject)
  const contract = await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: CopyrightContractStatus.updateAfterFirstPayment },
    { status: CopyrightContractStatus.canceled, actionAt: new Date() },
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

});

totalPaymentExpiration.process(async (job) => {
  // if there are no update status will be wait for the total payment (act as sp accept)
  const contract = await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: CopyrightContractStatus.waitingForTotalPayment },
    { status: CopyrightContractStatus.canceled, actionAt: new Date() },
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
});

onGoingExpiration.process(async (job) => {
  // after submit by 24 hour
  const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: CopyrightContractStatus.ongoing },
    {
      status: contractComplain ? CopyrightContractStatus.complaint : CopyrightContractStatus.completed,
      actionAt: new Date(),
    },
  );

  if (contractComplain) {
    // send notification for admin
  } else {
    // send total amount to sp & save transaction
  }
});
