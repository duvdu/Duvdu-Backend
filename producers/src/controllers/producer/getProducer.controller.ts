import 'express-async-errors';

import { NotFound, Producer } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetProducerHandler } from '../../types/endpoints';



export const getProducerHandler:GetProducerHandler = async (req,res,next)=>{
  const producers = await Producer.aggregate([
    {
      $match:{_id:new mongoose.Types.ObjectId(req.params.producerId)}
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
                    $cond: {
                      if: { $eq: ['ar', req.lang] },
                      then: '$$tag.ar',
                      else: '$$tag.en',
                    },
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
        category:1, 
        user:1
      },
    },
  ]);
    
  if (producers.length == 0) 
    return next(new NotFound({en:'producer not found' , ar:'لم يتم العثور على المنتج'} , req.lang));

  res.status(200).json({message:'success' , data:producers[0]});
};