import { Contracts, Icontract, SuccessResponse } from '@duvdu-v1/duvdu';
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

  const contracts = await Contracts.find(filter);
  res.status(200).json({
    message: 'success',
    data: contracts,
  });
};
