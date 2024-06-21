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
    { $match: filter },
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
      $unwind: {
        path: '$producer_contract',
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
          $switch: {
            branches: [
              {
                case: {
                  $ne: ['$copyright_contract', null],
                },
                then: '$copyright_contract',
              },
              {
                case: {
                  $ne: ['$producer_contract', null],
                },
                then: '$producer_contract',
              },
              {
                case: {
                  $ne: ['$rental_contract', null],
                },
                then: '$rental_contract',
              },
            ],
            default: null,
          },
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

  res.status(200).json({
    message: 'success',
    data: contracts,
  });
};
// import { Contracts, SuccessResponse } from '@duvdu-v1/duvdu';
// import { RequestHandler } from 'express';
// import mongoose from 'mongoose';

// export const getContracts: RequestHandler<
//   unknown,
//   SuccessResponse<{ data: any }>,
//   unknown,
//   { filter: 'i_created' | 'i_received' }
// > = async (req, res) => {
//   const filter: any = {};
//   if (req.query.filter === 'i_created')
//     filter.customer = new mongoose.Types.ObjectId(req.loggedUser.id);
//   else if (req.query.filter === 'i_received')
//     filter.sp = new mongoose.Types.ObjectId(req.loggedUser.id);
//   else
//     filter.$or = [
//       { customer: new mongoose.Types.ObjectId(req.loggedUser.id) },
//       { sp: new mongoose.Types.ObjectId(req.loggedUser.id) },
//     ];
//   const contracts = await Contracts.find(filter)
//     .populate([
//       { path: 'sp', select: 'isOnline profileImage username name rank projectsView' },
//       { path: 'customer', select: 'isOnline profileImage username name rank projectsView' },
//       { path: 'contract' },
//     ])
//     .sort({ createdAt: -1 });

//   res.status(200).json({ message: 'success', data: contracts });
// };
