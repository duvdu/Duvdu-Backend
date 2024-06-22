import 'express-async-errors';

import { MODELS, NotFound, Producer } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetProducerHandler } from '../../types/endpoints';



export const getProducerHandler:GetProducerHandler = async (req,res,next)=>{
  const producers = await Producer.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.producerId) },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    {
      $unwind: '$categoryData',
    },
    {
      $project: {
        _id: 1,
        subCategories: {
          $map: {
            input: '$subCategories',
            as: 'subCat',
            in: {
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$subCat.title.ar',
                  else: '$$subCat.title.en',
                },
              },
              tags: {
                $map: {
                  input: '$$subCat.tags',
                  as: 'tag',
                  in: {
                    title: {
                      $cond: {
                        if: { $eq: ['ar', req.lang] },
                        then: '$$tag.ar',
                        else: '$$tag.en',
                      },
                    },
                    _id: '$$tag._id', 
                  },
                },
              },
              _id: '$$subCat._id',
            },
          },
        },
        minBudget: 1,
        maxBudget: 1,
        searchKeywords: 1,
        createdAt: 1,
        updatedAt: 1,
        category: {
          _id: '$categoryData._id',
          image: {
            $concat: [process.env.BUCKET_HOST, '/', '$categoryData.image'],
          },
          title: {
            $cond: {
              if: { $eq: ['ar', req.lang] },
              then: '$categoryData.title.ar',
              else: '$categoryData.title.en',
            },
          },
        },
        user: {
          profileImage: {
            $cond: [
              { $eq: ['$user.profileImage', null] },
              null,
              { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
            ],
          },
          username: '$user.username',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name',
          rate: '$user.rate',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
        },
      },
    },
  ]);
  
  if (producers.length == 0) 
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  res.status(200).json({message:'success' , data:producers[0]});
};