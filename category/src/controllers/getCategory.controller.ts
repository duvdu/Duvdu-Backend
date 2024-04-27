import { NotFound, Categories } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetCategoryHandler } from '../types/endpoints/endpoints';

export const getCategoryHandler: GetCategoryHandler = async (req, res, next) => {
  const category = await Categories.aggregate([
    { $match: { status: true, _id: new mongoose.Types.ObjectId(req.params.categoryId) } },
    { $limit: 1 },
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
        jobTitles: 1,
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
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        image: 1,
      },
    },
  ]);
  console.log(category);
  if (!category) return next(new NotFound('category not found'));
  res.status(200).json({ message: 'success', data: category as any });
};
