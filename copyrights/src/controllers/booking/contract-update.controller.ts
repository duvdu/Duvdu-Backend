import { addToDate, BadRequestError, NotFound, SuccessResponse, CopyrightContracts, CopyrightContractStatus, Channels, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';

// import { contractNotification } from './contract-notification.controller';

export const updateContractHandler: RequestHandler<
  { contractId: string },
  SuccessResponse,
  {
    details: string;
    totalPrice: number;
    duration: { value: number; unit: string };
    deadline: string; //
  }
> = async (req, res, next) => {
  // assert contract
  const contract = await CopyrightContracts.findOne({
    _id: req.params.contractId,
    sp: req.loggedUser.id,
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  if (contract.status !== CopyrightContractStatus.updateAfterFirstPayment) {
    return next(
      new BadRequestError(
        {
          en: 'invalid, contract status is ' + contract.status,
          ar: 'invalid, contract status is ' + contract.status,
        },
        req.lang,
      ),
    );
  }

  // assert deadline after update
  if (req.body.duration) {
    req.body.deadline = addToDate(
      new Date(contract.startDate),
      req.body.duration.unit as any,
      req.body.duration.value,
    ).toISOString();
  }
  if (req.body.deadline)
    assertDeadline(new Date(req.body.deadline), new Date(contract.deadline), req.lang);

  await CopyrightContracts.updateOne({ _id: req.params.contractId }, req.body);

  const user = await Users.findOne({ _id: req.loggedUser.id });

  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} updated the contract`,
      Channels.update_contract,
    ),
    sendNotification(
      req.loggedUser.id,
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} updated the contract`,
      Channels.update_contract,
    ),
  ]);
  res.status(200).json({ message: 'success' });
};

const assertDeadline = (newDeadline: Date, oldDeadline: Date, lang: string) => {
  if (newDeadline.getTime() < oldDeadline.getTime()) {
    throw new BadRequestError(
      {
        en: 'new deadline is lower than old deadline',
        ar: 'new deadline is lower than old deadline',
      },
      lang,
    );
  }
};
