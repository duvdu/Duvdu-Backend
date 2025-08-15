import {
  ContractCancel,
  Contracts,
  IContractCancel,
  MODELS,
  PaginationResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import 'express-async-errors';

export const getContractCancelFilter: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    user?: string;
    contract?: string;
    search?: string;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.user)
    req.pagination.filter.user = new mongoose.Types.ObjectId(req.query.user);
  if (req.query.contract)
    req.pagination.filter.contract = new mongoose.Types.ObjectId(req.query.contract);
  
  // Store search term separately for use in aggregation pipeline
  if (req.query.search) {
    req.pagination.searchTerm = req.query.search;
    req.pagination.filter.cancelReason = { $regex: req.query.search, $options: 'i' };
  }

  next();
};

export const getContractsCancel: RequestHandler<
  unknown,
  PaginationResponse<{ data: IContractCancel[] }>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    // Build aggregation pipeline for contract cancellations with user search
    const pipeline: any[] = [];
    
    // Build initial match conditions (before lookup for performance)
    const initialMatchConditions: any = {};
    
    // Apply existing filters on ObjectId fields before lookup
    if (req.pagination.filter.user) {
      initialMatchConditions.user = req.pagination.filter.user;
    }
    if (req.pagination.filter.contract) {
      initialMatchConditions.contract = req.pagination.filter.contract;
    }
    
    // Add initial match stage if we have ObjectId filters
    if (Object.keys(initialMatchConditions).length > 0) {
      pipeline.push({ $match: initialMatchConditions });
    }
    
    // Add lookup for user data
    pipeline.push({
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    });
    
    // Unwind user array
    pipeline.push({ $unwind: '$user' });
    
    // Build search match conditions (after lookup)
    const searchMatchConditions: any = {};
    
    // Apply search conditions (search in both cancelReason and user fields)
    if (req.pagination.searchTerm) {
      searchMatchConditions.$or = [
        { cancelReason: { $regex: req.pagination.searchTerm, $options: 'i' } },
        { 'user.name': { $regex: req.pagination.searchTerm, $options: 'i' } },
        { 'user.email': { $regex: req.pagination.searchTerm, $options: 'i' } },
        { 'user.username': { $regex: req.pagination.searchTerm, $options: 'i' } },
        { 'user.phoneNumber.number': { $regex: req.pagination.searchTerm, $options: 'i' } },
      ];
    }
    
    // Add search match stage if we have search conditions
    if (Object.keys(searchMatchConditions).length > 0) {
      pipeline.push({ $match: searchMatchConditions });
    }
    
    // Add project stage to select required user fields
    pipeline.push({
      $project: {
        user: {
          _id: '$user._id',
          name: '$user.name',
          profileImage: '$user.profileImage',
          phoneNumber: '$user.phoneNumber',
          email: '$user.email',
        },
        contract: 1,
        cancelReason: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });
    
    // Get total count
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await ContractCancel.aggregate(countPipeline);
    const resultCount = countResult.length > 0 ? countResult[0].total : 0;
    
    // Add pagination
    pipeline.push({ $skip: req.pagination.skip });
    pipeline.push({ $limit: req.pagination.limit });
    
    // Execute aggregation
    const contractCancels = await ContractCancel.aggregate(pipeline);

    // Get all contract IDs from the cancellations
    const contractIds = contractCancels.map((cancel) => cancel.contract);

    // Fetch all contracts with their details
    const contracts = await Contracts.aggregate([
      {
        $match: {
          _id: { $in: contractIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
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
        $unwind: {
          path: '$team_contracts',
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
        $lookup: {
          from: MODELS.contractReview,
          localField: '_id',
          foreignField: 'contract',
          as: 'review',
        },
      },
      {
        $set: {
          hasReview: { $gt: [{ $size: '$review' }, 0] },
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
          hasReview: 1,
          customer: {
            _id: '$customer._id',
            name: '$customer.name',
            username: '$customer.username',
            isOnline: '$customer.isOnline',
            profileImage: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$customer.profileImage',
                    regex: new RegExp(process.env.BUCKET_HOST || ''),
                  },
                },
                then: '$customer.profileImage',
                else: { $concat: [process.env.BUCKET_HOST, '/', '$customer.profileImage'] },
              },
            },
            faceRecognition: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$customer.faceRecognition',
                    regex: new RegExp(process.env.BUCKET_HOST || ''),
                  },
                },
                then: '$customer.faceRecognition',
                else: { $concat: [process.env.BUCKET_HOST, '/', '$customer.faceRecognition'] },
              },
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
                if: {
                  $regexMatch: {
                    input: '$sp.profileImage',
                    regex: new RegExp(process.env.BUCKET_HOST || ''),
                  },
                },
                then: '$sp.profileImage',
                else: { $concat: [process.env.BUCKET_HOST, '/', '$sp.profileImage'] },
              },
            },
            faceRecognition: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: '$sp.faceRecognition',
                    regex: new RegExp(process.env.BUCKET_HOST || ''),
                  },
                },
                then: '$sp.faceRecognition',
                else: { $concat: [process.env.BUCKET_HOST, '/', '$sp.faceRecognition'] },
              },
            },
            email: '$sp.email',
            phoneNumber: '$sp.phoneNumber',
          },
        },
      },
    ]);

    // Create a map of contracts by ID for easy lookup
    const contractsMap = contracts.reduce((map, contract) => {
      map[contract._id.toString()] = contract;
      return map;
    }, {});

    // Combine contract cancels with their contract details and handle user image URLs
    const contractCancelsWithDetails = contractCancels.map((cancel) => {
      const contractId = cancel.contract.toString();
      
      // Handle user profile image URL
      if (cancel.user && cancel.user.profileImage) {
        if (!cancel.user.profileImage.includes(process.env.BUCKET_HOST || '')) {
          cancel.user.profileImage = `${process.env.BUCKET_HOST}/${cancel.user.profileImage}`;
        }
      }
      
      return {
        ...cancel,
        contract: contractsMap[contractId] || null,
      };
    });

    // Return paginated response
    return res.status(200).json({
      message: 'success',
      pagination: {
        currentPage: req.pagination.page,
        totalPages: Math.ceil(resultCount / req.pagination.limit),
        resultCount: resultCount,
      },
      data: contractCancelsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};
