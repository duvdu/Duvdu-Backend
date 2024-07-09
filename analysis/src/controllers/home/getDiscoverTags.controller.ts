import 'express-async-errors';
import { Categories } from '@duvdu-v1/duvdu';

import { GetDiscoverTagsHandler } from '../../types/endpoints/home.endpoints';



export const getDiscoverTagsHandler:GetDiscoverTagsHandler = async (req,res)=>{

  const category = await Categories.aggregate([
    { $match: { trend: true } },
    { $unwind: '$subCategories' },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryTitle: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$title.ar',
            else: '$title.en',
          },
        },
        subCategoryTitle: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategories.title.ar',
            else: '$subCategories.title.en',
          },
        },
        subCategoryId: '$subCategories._id',
        image: {
          $cond: {
            if: { $ne: ['$image', null] },
            then: { $concat: [process.env.BUCKET_HOST, '/', '$image'] },
            else: null,
          },
        },
      },
    },
    {
      $sample: { size: 100 } 
    },
    {
      $group: {
        _id: null,
        subCategories: {
          $push: {
            categoryId: '$categoryId',
            categoryTitle: '$categoryTitle',
            _id: '$subCategoryId',
            title: '$subCategoryTitle',
            image: '$image',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subCategories: 1,
        cycle:1
      },
    },
  ]);

  res.status(200).json({message:'success' , data:category});
  
};