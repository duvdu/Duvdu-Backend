import { BadRequestError, Channels, NotFound, SuccessResponse, TeamContract, TeamContractStatus, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from '../project/sendNotification';


export const submitFilesHandler: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { link: string; notes: string }
> = async (req, res, next) => {
  // assert booking
  const contract = await TeamContract.findOne({
    _id: req.params.contractId,
    sp: req.loggedUser.id,
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  // assert booking state
  if (!(contract.status === TeamContractStatus.ongoing))
    return next(new BadRequestError(undefined, req.lang));

  await TeamContract.updateOne(
    { _id: req.params.contractId },
    { submitFiles: { link: req.body.link, notes: req.body.notes } },
  );

  const sp = await Users.findById(contract.sp);
  if (sp) {
    await sendNotification(
      req.loggedUser.id,
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'team contract updates',
      `${sp?.name} submitted files for the project`,
      Channels.update_contract,
    );
    await sendNotification(
      req.loggedUser.id,
      req.loggedUser.id,
      contract._id.toString(),
      'contract',
      'team contract updates',
      'you submitted files for the project successfully',
      Channels.update_contract,
    );
  }
  res.json({ message: 'success' });
};
