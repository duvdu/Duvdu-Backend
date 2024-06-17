import { MODELS, NotFound } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { ProducerContract } from '../../models/producerContracts.model';
import { GetContractHandler } from '../../types/endpoints';

export const getContarctHandler: GetContractHandler = async (req, res, next) => {

  
  const contracts = await ProducerContract.aggregate([
    {
      $match: {_id:new mongoose.Types.ObjectId(req.params.contractId)}
    },
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
                    { $concat: [process.env.BUCKET_HOST, '$producerUser.profileImage'] },
                  ],
                },
                username: '$producerUser.username',
                isOnline: '$producerUser.isOnline',
                acceptedProjectsCounter: '$producerUser.acceptedProjectsCounter',
                name: '$producerUser.name',
                rate: '$producerUser.rate',
                rank: '$producerUser.rank',
                projectsView: '$producerUser.projectsView',
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
          profileImage: { $concat: [process.env.BUCKET_HOST, '$userDetails.profileImage'] },
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
      },
    },
  ]);

  if (contracts.length === 0) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));
  
  res.status(200).json({message:'success' , data:contracts[0]});
};
