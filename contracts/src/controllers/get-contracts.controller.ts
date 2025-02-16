import { Contracts, SuccessResponse, MODELS } from '@duvdu-v1/duvdu';
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

  console.log(await Contracts.aggregate([{ $match: filter }]));

  const contracts = await Contracts.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: MODELS.copyrightContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'copyright_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.rentalContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'rental_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.producerContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'producer_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.projectContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'project_contracts',
      },
    },
    {
      $lookup: {
        from: MODELS.teamContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'team_contracts',
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
        path: '$team_contracts',
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
                  $ifNull: [
                    '$producer_contract',
                    '$rental_contract',
                    '$project_contracts',
                    '$team_contracts',
                  ],
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
        from: MODELS.user,
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    {
      $lookup: {
        from: MODELS.user,
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
          faceRecognition: {
            $concat: [process.env.BUCKET_HOST, '/', '$sp.faceRecognition'],
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
          profileImage: {
            $cond: {
              if: { $regexMatch: { input: '$customer.profileImage', regex: new RegExp(process.env.BUCKET_HOST || '') } },
              then: '$customer.profileImage',
              else: { $concat: [process.env.BUCKET_HOST, '/', '$customer.profileImage'] }
            }
          },
          faceRecognition: {
            $cond: {
              if: { $regexMatch: { input: '$customer.faceRecognition', regex: new RegExp(process.env.BUCKET_HOST || '') } },
              then: '$customer.faceRecognition',
              else: { $concat: [process.env.BUCKET_HOST, '/', '$customer.faceRecognition'] }
            }
          },
          email: '$customer.email',
          phoneNumber: '$customer.phoneNumber',
        },
        sp: {
          _id: '$sp._id',
          name: '$sp.name',
          username: '$sp.username',
          isOnline: '$sp.isOnline',
          profileImage: {
            $cond: {
              if: { $regexMatch: { input: '$sp.profileImage', regex: new RegExp(process.env.BUCKET_HOST || '') } },
              then: '$sp.profileImage',
              else: { $concat: [process.env.BUCKET_HOST, '/', '$sp.profileImage'] }
            }
          },
          faceRecognition: {
            $cond: {
              if: { $regexMatch: { input: '$sp.faceRecognition', regex: new RegExp(process.env.BUCKET_HOST || '') } },
              then: '$sp.faceRecognition',
              else: { $concat: [process.env.BUCKET_HOST, '/', '$sp.faceRecognition'] }
            }
          },
          email: '$sp.email',
          phoneNumber: '$sp.phoneNumber',
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
