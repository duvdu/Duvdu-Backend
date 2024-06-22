import 'express-async-errors';

import { Categories } from '@duvdu-v1/duvdu';

import { GetTrendyCategoriesHandler } from '../../types/endpoints/home.endpoints';


export const getTrendyCategoriesHandler:GetTrendyCategoriesHandler = async (req,res)=>{

  const category = await Categories.aggregate([
    { $match: {trend:true} },
    {
      $project: {
        title: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$title.ar',
            else: '$title.en',
          },
        },
        _id: 1,
        creativesCounter: 1,
        cycle: 1,
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
                    _id: '$$tag._id',
                    title: {
                      $cond: {
                        if: { $eq: ['ar', req.lang] },
                        then: '$$tag.ar',
                        else: '$$tag.en',
                      },
                    },
                  },
                },
              },
              _id: '$$subCat._id',
            },
          },
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        image: 1,
        jobTitles: {
          $map: {
            input: '$jobTitles',
            as: 'title',
            in: {
              $cond: {
                if: { $eq: ['ar', req.lang] },
                then: '$$title.ar',
                else: '$$title.en',
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        image: {
          $concat: [process.env.BUCKET_HOST, '/', '$image']
        }
      }
    },
  ]);

  res.status(200).json({message:'success' , data:category});
};