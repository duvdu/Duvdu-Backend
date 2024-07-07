import { addToDate, BadRequestError, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
import { ContractStatus, CopyrightContracts } from '../../models/copyright-contract.model';

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

  if (contract.status !== ContractStatus.updateAfterFirstPayment) {
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
      contract.startDate,
      req.body.duration.unit as any,
      req.body.duration.value,
    ).toISOString();
  }
  if (req.body.deadline)
    assertDeadline(new Date(req.body.deadline), new Date(contract.deadline), req.lang);

  await CopyrightContracts.updateOne({ _id: req.params.contractId }, req.body);

  // await contractNotification(
  //   contract.id,
  //   contract.sp.toString(),
  //   `copyright contract, customer updated the contract, please take action within ${contract.stageExpiration}h or ask customer for another update`,
  // );
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
