import { BadRequestError, NotFound, SuccessResponse, ProjectContract, ProjectContractStatus } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


export const submitFilesHandler: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { link: string; notes: string }
> = async (req, res, next) => {
  // assert booking
  const contract = await ProjectContract.findOne({
    _id: req.params.contractId,
    sp: req.loggedUser.id,
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  // assert booking state
  if (!(contract.status === ProjectContractStatus.ongoing))
    return next(new BadRequestError(undefined, req.lang));

  await ProjectContract.updateOne(
    { _id: req.params.contractId },
    { submitFiles: { link: req.body.notes, notes: req.body.notes } },
  );

  res.json({ message: 'success' });
};
