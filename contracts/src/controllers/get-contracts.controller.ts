import { Contracts, Icontract, Iuser, SuccessResponse } from '@duvdu-v1/duvdu';
import { ContractStatus } from '@duvdu-v1/duvdu/build/models/contracts.model';
import { RequestHandler } from 'express';

export const getContracts: RequestHandler<
  unknown,
  SuccessResponse<{ data: Icontract[] }>,
  unknown,
  { filter: 'i_created' | 'i_received' }
> = async (req, res) => {
  const filter: any = {};
  if (req.query.filter === 'i_created') filter.sourceUser = req.loggedUser.id;
  else if (req.query.filter === 'i_received') filter.targetUser = req.loggedUser.id;
  else filter.$or = [{ sourceUser: req.loggedUser.id }, { targetUser: req.loggedUser.id }];

  const contracts = await Contracts.find(filter)
    .populate([{ path: 'targetUser', select: 'username name profileImage isOnline rank projectsView' }])
    .lean();
  contracts.forEach((contract) => {
    if ((contract.targetUser as Iuser).profileImage)
      (contract.targetUser as Iuser).profileImage =
        process.env.BUCKET_HOST + '/' + (contract.targetUser as Iuser).profileImage;
    if (contract.status !== ContractStatus.pending) return contract;
    const createdAt = new Date(contract.createdAt).getTime();
    const responseNoticePeriod = createdAt + 24 * 60 * 60 * 1000;
    (contract as any).remainingTime = parseInt(`${(responseNoticePeriod - Date.now()) / 1000}`);
    return contract;
  });
  res.status(200).json({
    message: 'success',
    data: contracts,
  });
};
