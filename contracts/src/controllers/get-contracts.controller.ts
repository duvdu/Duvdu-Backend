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

//   const contracts = await Contracts.aggregate([
//     {
//       $facet: {
//         rental_contracts: [
//           { $match: { ref: 'rental_contracts' } },
//           {
//             $lookup: {
//               from: 'rental_contracts',
//               localField: 'contract',
//               foreignField: '_id',
//               as: 'contract',
//             },
//           },
//           {
//             $unwind: {
//               path: '$contract',
//               preserveNullAndEmptyArrays: true,
//             },
//           },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'customer',
//               foreignField: '_id',
//               as: 'customer',
//             },
//           },
//           { $unwind: '$customer' },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'sp',
//               foreignField: '_id',
//               as: 'sp',
//             },
//           },
//           { $unwind: '$sp' },
//           {
//             $project: {
//               _id: 1,
//               ref: 1,
//               contract: 1,
//               customer: {
//                 _id: '$customer._id',
//                 name: '$customer.name',
//                 username: '$customer.username',
//                 isOnline: '$customer.isOnline',
//                 profileImage: '$customer.profileImage',
//               },
//               sp: {
//                 _id: '$sp._id',
//                 name: '$sp.name',
//                 username: '$sp.username',
//                 isOnline: '$sp.isOnline',
//                 profileImage: '$sp.profileImage',
//               },
//             },
//           },
//         ],
//         copyright_contracts: [
//           { $match: { ref: 'copyright_contracts' } },
//           {
//             $lookup: {
//               from: 'copyright_contracts',
//               localField: 'contract',
//               foreignField: '_id',
//               as: 'contract',
//             },
//           },
//           {
//             $unwind: {
//               path: '$contract',
//               preserveNullAndEmptyArrays: true,
//             },
//           },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'customer',
//               foreignField: '_id',
//               as: 'customer',
//             },
//           },
//           { $unwind: '$customer' },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'sp',
//               foreignField: '_id',
//               as: 'sp',
//             },
//           },
//           { $unwind: '$sp' },
//           {
//             $project: {
//               _id: 1,
//               ref: 1,
//               contract: 1,
//               customer: {
//                 _id: '$customer._id',
//                 name: '$customer.name',
//                 username: '$customer.username',
//                 isOnline: '$customer.isOnline',
//                 profileImage: '$customer.profileImage',
//               },
//               sp: {
//                 _id: '$sp._id',
//                 name: '$sp.name',
//                 username: '$sp.username',
//                 isOnline: '$sp.isOnline',
//                 profileImage: '$sp.profileImage',
//               },
//             },
//           },
//         ],
//       },
//     },
//   ]);
//   contracts[0].rental_contracts.forEach((contract: any) => {
//     const createdAt = new Date(contract.contract.createdAt).getTime();
//     const responseNoticePeriod = createdAt + contract.contract?.stageExpiration * 60 * 60 * 1000;
//     (contract as any).remainingTime = parseInt(`${(responseNoticePeriod - Date.now()) / 1000}`);
//   });
//   contracts[0].copyright_contracts.forEach((contract: any) => {
//     const createdAt = new Date(contract.contract.createdAt).getTime();
//     const responseNoticePeriod = createdAt + contract.contract?.stageExpiration * 60 * 60 * 1000;
//     (contract as any).remainingTime = parseInt(`${(responseNoticePeriod - Date.now()) / 1000}`);
//   });

//   res.status(200).json({
//     message: 'success',
//     data: contracts[0],
//   });
// };
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
  const contracts = await Contracts.find(filter).populate([
    {path:'sp' , select:'isOnline profileImage username name rank projectsView'} ,
    {path:'customer' , select:'isOnline profileImage username name rank projectsView'} ,
    {path:'contract'}
  ]).sort({createdAt: -1});

  res.status(200).json({message:'success' , data:contracts});
    
};
