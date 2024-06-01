/* eslint-disable indent */
import {
  BadRequestError,
  Contracts,
  ContractStatus,
  Icontract,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const takeAction: RequestHandler<
  { contractId: string },
  SuccessResponse<{ data: Icontract }>,
  { action: ContractStatus; submitFiles?: { link?: string; notes?: string } }
> = async (req, res, next) => {
  const contract = await Contracts.findById(req.params.contractId);
  if (!contract) return next(new NotFound(undefined , req.lang));

  if (
    // req.loggedUser.id.toString() !== contract.sourceUser.toString() &&
    req.loggedUser.id.toString() !== contract.targetUser.toString()
  )
    return next(new NotAllowedError(undefined , req.lang));

  switch (req.body.action) {
    case ContractStatus.ongoing:
      if (contract.status !== ContractStatus.pending)
        return next(new BadRequestError({en:`contract is already ${contract.status}` , ar:`العقد بالفعل ${contract.status}`} , req.lang));
      if (new Date(contract.createdAt).getTime() + 24 * 60 * 60 * 1000 < new Date().getTime())
        return next(new BadRequestError({en:'timeout' , ar:'انتهاء المهلة'} , req.lang));
      await updatePendingToOngoing(contract.id);
      break;
    case ContractStatus.rejected:
      if (contract.status !== ContractStatus.pending)
        return next(new BadRequestError({en:`contract is already ${contract.status}` , ar:`العقد بالفعل ${contract.status}`} , req.lang));
      if (new Date(contract.createdAt).getTime() + 24 * 60 * 60 * 1000 < new Date().getTime())
        return next(new BadRequestError('timeout'));
      await updatePendingToRejected(contract.id);
      break;
    case ContractStatus.completed:
      if (contract.status !== ContractStatus.ongoing)
        return next(new BadRequestError({en:`contract is already ${contract.status}` , ar:`العقد بالفعل ${contract.status}`} , req.lang));
      await updatePendingToCompleted(contract, req.body.submitFiles);
      break;
  }

  (contract as any)._doc.status = req.body.action;
  res.status(200).json({
    message: 'success',
    data: contract,
  });
};

const updatePendingToOngoing = async (id: string) => {
  const x = await Contracts.updateOne({ _id: id }, { status: ContractStatus.ongoing });
  console.log(x);
  // TODO: send notification to source user that state has changed
};

const updatePendingToRejected = async (id: string) => {
  await Contracts.updateOne({ _id: id }, { status: ContractStatus.rejected });
  // TODO: send notification to source user that state has changed
};

const updatePendingToCompleted = async (
  contract: Icontract,
  submitFiles?: { link?: string; notes?: string },
) => {
  const user = await Users.findOneAndUpdate(
    { _id: contract.targetUser, avaliableContracts: { $gte: 1 } },
    { $inc: { avaliableContracts: -1, acceptedProjectsCounter: 1 } },
  );
  if (!user) throw new BadRequestError('check your plan first');

  contract.project;
  await Contracts.updateOne(
    { _id: contract.id },
    { status: ContractStatus.completed, submitedAt: Date.now() },
  );

  if (submitFiles)
    await mongoose.connection.db.collection(contract.ref).updateOne(
      { _id: new mongoose.Types.ObjectId(contract.project) },
      {
        $set: {
          submitFiles,
        },
      },
    );
  // TODO: send notification to source user that state has changed
};
