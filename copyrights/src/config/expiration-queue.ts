import { ContractReports } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from './env';
import { ContractStatus, CopyrightContracts } from '../models/copyright-contract.model';

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
  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: ContractStatus.pending },
    { status: ContractStatus.canceled, actionAt: new Date() },
  );
});

firstPaymentExpiration.process(async (job) => {
  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: ContractStatus.waitingForFirstPayment },
    { status: ContractStatus.canceled, actionAt: new Date() },
  );
});

updateAfterFirstPaymentExpiration.process(async (job) => {
  // if there are no update status will be wait for the total payment (act as sp reject)
  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: ContractStatus.updateAfterFirstPayment },
    { status: ContractStatus.canceled, actionAt: new Date() },
  );
});

totalPaymentExpiration.process(async (job) => {
  // if there are no update status will be wait for the total payment (act as sp accept)
  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: ContractStatus.waitingForTotalPayment },
    { status: ContractStatus.canceled, actionAt: new Date() },
  );
});

onGoingExpiration.process(async (job) => {
  // after submit by 24 hour
  const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

  await CopyrightContracts.findOneAndUpdate(
    { _id: job.data.contractId, status: ContractStatus.ongoing },
    {
      status: contractComplain ? ContractStatus.complaint : ContractStatus.completed,
      actionAt: new Date(),
    },
  );

  if (contractComplain) {
    // send notification for admin
  } else {
    // send total amount to sp & save transaction
  }
});
