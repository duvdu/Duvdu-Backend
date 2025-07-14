import { Contracts, Iuser, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getAvaliableUserICanChatHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: Iuser[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const loggedUserId = req.loggedUser.id;

  const contracts = await Contracts.find({
    $or: [{ sp: loggedUserId }, { customer: loggedUserId }],
  }).populate({
    path: 'contract',
    match: {
      status: { $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'] },
    },
  });

  const filteredContracts = contracts.filter((contract) => contract.contract !== null);

  const contractUserIds = filteredContracts
    .map((contract) => (contract.sp.toString() === loggedUserId ? contract.customer : contract.sp))
    .filter((id) => id.toString() !== loggedUserId.toString());

  const potentialChatUserIds = [...new Set([...contractUserIds])];

  const potentialChatUsers = await Users.find(
    {
      _id: { $in: potentialChatUserIds },
    },
    'name email username isOnline profileImage',
  );

  res.json({ message: 'success', data: potentialChatUsers });
};
