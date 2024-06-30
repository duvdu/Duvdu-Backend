import { Contracts, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const getContract: RequestHandler<
  { contractId: string },
  SuccessResponse<{ data: any }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const contract = await Contracts.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.contractId),
        $or: [
          { customer: new mongoose.Types.ObjectId(req.loggedUser.id) },
          { sp: new mongoose.Types.ObjectId(req.loggedUser.id) },
        ],
      },
    },
    {
      $lookup: {
        from: 'copyright_contracts',
        localField: 'contract',
        foreignField: '_id',
        as: 'copyright_contract',
      },
    },
    {
      $lookup: {
        from: 'rental_contracts',
        localField: 'contract',
        foreignField: '_id',
        as: 'rental_contract',
      },
    },
    {
      $lookup: {
        from: 'producer-contracts',
        localField: 'contract',
        foreignField: '_id',
        as: 'producer_contract',
      },
    },
    {
      $lookup: {
        from: 'project_contracts',
        localField: 'contract',
        foreignField: '_id',
        as: 'project_contracts',
      },
    },
    {
      $unwind: {
        path: '$producer_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$project_contracts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$rental_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$copyright_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        contract: {
          $ifNull: [
            {
              $ifNull: [
                '$copyright_contract',
                {
                  $ifNull: ['$producer_contract', '$rental_contract', '$project_contracts'],
                },
              ],
            },
            null,
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    {
      $lookup: {
        from: 'users',
        localField: 'sp',
        foreignField: '_id',
        as: 'sp',
      },
    },
    { $unwind: '$sp' },
    {
      $set: {
        customer: {
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$customer.profileImage'],
          },
        },
        sp: {
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$sp.profileImage'],
          },
        },
        contract: {
          attachments: {
            $map: {
              input: '$contract.attachments',
              as: 'attachment',
              in: {
                $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        ref: 1,
        cycle: 1,
        contract: 1,
        customer: {
          _id: '$customer._id',
          name: '$customer.name',
          username: '$customer.username',
          isOnline: '$customer.isOnline',
          profileImage: '$customer.profileImage',
        },
        sp: {
          _id: '$sp._id',
          name: '$sp.name',
          username: '$sp.username',
          isOnline: '$sp.isOnline',
          profileImage: '$sp.profileImage',
        },
      },
    },
  ]);
  if (!contract) return next(new NotFound(undefined, req.lang));

  res.status(200).json({
    message: 'success',
    data: contract?.[0],
  });
};
