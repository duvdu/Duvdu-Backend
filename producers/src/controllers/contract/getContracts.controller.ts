import 'express-async-errors';
import { ContractStatus, MODELS, ProducerContract } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { GetUserContractsHandler } from '../../types/endpoints';


export const getContractsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    producer?: string; 
    projectType?: string;
    platform?: string;
    status?: ContractStatus;
    startDate?: Date;
    endDate?: Date;
    filter?:'i_created'|'i_recieved'
  }
> = async (req, res, next) => {
  
  req.pagination.filter = {};

  if (req.query.producer) {
    req.pagination.filter.producer = new mongoose.Types.ObjectId(req.query.producer);
  }
  if (req.query.projectType) {
    req.pagination.filter.projectType = req.query.projectType;
  }
  if (req.query.platform) {
    req.pagination.filter.platform = req.query.platform;
  }
  if (req.query.status) {
    req.pagination.filter.status = req.query.status;
  }
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.appointmentDate = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }

  if (req.query.filter === 'i_recieved') 
    req.pagination.filter['producer.user._id'] = new mongoose.Types.ObjectId(req.loggedUser.id);

  if (req.query.filter === 'i_created') 
    req.pagination.filter['user._id'] = new mongoose.Types.ObjectId(req.loggedUser.id);
  
  if (req.query.filter == undefined) 
    req.pagination.filter['user._id'] = new mongoose.Types.ObjectId(req.loggedUser.id);

  next();
};



export const getContractsHandler:GetUserContractsHandler = async (req,res)=>{
  

  const contracts = await ProducerContract.aggregate([
    {
      $lookup: {
        from: MODELS.producer,
        localField: 'producer',
        foreignField: '_id',
        as: 'producerData',
      },
    },
    {
      $unwind: {
        path: '$producerData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'producerData.user',
        foreignField: '_id',
        as: 'producerUser',
      },
    },
    {
      $unwind: {
        path: '$producerUser',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        producer: {
          _id: '$producerData._id',
          user: {
            $cond: {
              if: { $eq: ['$producerUser', null] },
              then: {}, 
              else: {
                profileImage: {
                  $cond: [
                    { $eq: ['$producerUser.profileImage', null] },
                    null,
                    { $concat: [process.env.BUCKET_HOST , '/', '$producerUser.profileImage'] },
                  ],
                },
                username: '$producerUser.username',
                isOnline: '$producerUser.isOnline',
                acceptedProjectsCounter: '$producerUser.acceptedProjectsCounter',
                name: '$producerUser.name',
                rate: '$producerUser.rate',
                rank: '$producerUser.rank',
                projectsView: '$producerUser.projectsView',
                _id:'$producerUser._id'
              },
            },
          },
          category: '$producerData.category',
          subCategories: {
            $map: {
              input: '$producerData.subCategories',
              as: 'subCategory',
              in: {
                title: {
                  $switch: {
                    branches: [
                      { case: { $eq: [req.lang, 'ar'] }, then: '$$subCategory.title.ar' },
                      { case: { $eq: [req.lang, 'en'] }, then: '$$subCategory.title.en' },
                    ],
                    default: '$$subCategory.title.en',
                  },
                },
                tags: {
                  $map: {
                    input: '$$subCategory.tags',
                    as: 'tag',
                    in: {
                      $switch: {
                        branches: [
                          { case: { $eq: [req.lang, 'ar'] }, then: '$$tag.ar' },
                          { case: { $eq: [req.lang, 'en'] }, then: '$$tag.en' },
                        ],
                        default: '$$tag.en',
                      },
                    },
                  },
                },
              },
            },
          },
          maxBudget: '$producerData.maxBudget',
          minBudget: '$producerData.minBudget',
          searchKeywords: '$producerData.searchKeywords',
        },
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: { $concat: [process.env.BUCKET_HOST ,'/', '$userDetails.profileImage'] },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
        },
        projectType: 1,
        platform: 1,
        projectDetails: 1,
        episodesNumber: 1,
        episodesDuration: 1,
        expectedBudget: 1,
        expectedProfits: 1,
        address: 1,
        location: 1,
        appointmentDate: 1,
        status: 1,
        stageExpiration: 1,
        actionAt: 1,
        rejectedBy:1
      },
    },
    {
      $match: req.pagination.filter,
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res.status(200).json({
    message:'success',
    data:contracts
  });
};