import 'express-async-errors';

import { Categories } from '@duvdu-v1/duvdu';

import { GetPopularSubCategoriesHandler } from '../../types/endpoints/home.endpoints';

export const getPopularSubCategoriesHandler: GetPopularSubCategoriesHandler = async (req, res) => {
  const categories = await Categories.aggregate([
    { $match: { trend: true } },
    { $unwind: '$subCategories' },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        cycle: '$cycle',
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
        tags: {
          $map: {
            input: '$subCategories.tags',
            as: 'tag',
            in: {
              name: {
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
      $sample: { size: 100 },
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
            tags: '$tags',
            image: '$image',
            cycle: '$cycle',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subCategories: 1,
      },
    },
  ]);
  res.status(200).json({ message: 'success', data: categories });
};
