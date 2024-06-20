import { Contracts, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const getContracts: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>,
  unknown,
  { filter: 'i_created' | 'i_received' }
> = async (req, res) => {
  const filter: any = {};
  if (req.query.filter === 'i_created')
    filter.customer = new mongoose.Types.ObjectId(req.loggedUser.id);
  else if (req.query.filter === 'i_received')
    filter.sp = new mongoose.Types.ObjectId(req.loggedUser.id);
  else
    filter.$or = [
      { customer: new mongoose.Types.ObjectId(req.loggedUser.id) },
      { sp: new mongoose.Types.ObjectId(req.loggedUser.id) },
    ];

  const contracts = await Contracts.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: 'rental_contracts',
        localField: 'contract',
        foreignField: '_id',
        as: 'contractDetails',
      },
    },
    { $unwind: '$contractDetails' },
    {
      $set: {
        contract: '$contractDetails',
      },
    },
    {
      $unset: 'contractDetails',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerDetails',
      },
    },
    { $unwind: '$customerDetails' },
    {
      $set: {
        customer: {
          _id: '$customerDetails._id',
          name: '$customerDetails.name',
          username: '$customerDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$customerDetails.profileImage'],
          },
        },
      },
    },
    { $unset: 'customerDetails' },
    {
      $lookup: {
        from: 'users',
        localField: 'sp',
        foreignField: '_id',
        as: 'spDetails',
      },
    },
    { $unwind: '$spDetails' },
    {
      $set: {
        sp: {
          _id: '$spDetails._id',
          name: '$spDetails.name',
          username: '$spDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$spDetails.profileImage'],
          },
        },
      },
    },
    { $unset: 'spDetails' },
  ]);
  console.log('cccccc', contracts);
  contracts.forEach((contract) => {
    //   if (
    //     (contract.targetUser as Iuser).profileImage &&
    //     !(contract.targetUser as Iuser).profileImage?.startsWith('http')
    //   )
    //     (contract.targetUser as Iuser).profileImage =
    //       process.env.BUCKET_HOST, '/' + '/' + (contract.targetUser as Iuser).profileImage;
    //   if (contract.status !== ContractStatus.pending) return contract;
    // TODO: calc remaining time for all cases
    const createdAt = new Date(contract.contract.createdAt).getTime();
    // console.log('createdAt', createdAt);
    const responseNoticePeriod = createdAt + contract.contract?.stageExpiration * 60 * 60 * 1000;
    // console.log('response period in milli', responseNoticePeriod);
    (contract as any).remainingTime = parseInt(`${(responseNoticePeriod - Date.now()) / 1000}`);
    // console.log('remaining', parseInt(`${(responseNoticePeriod - Date.now()) / 1000}`));
    //   return contract;
  });
  res.status(200).json({
    message: 'success',
    data: contracts,
  });
};
