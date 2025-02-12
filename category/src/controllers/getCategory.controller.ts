import { NotFound, Categories, MODELS } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetCategoryHandler } from '../types/endpoints/endpoints';

export const getCategoryHandler: GetCategoryHandler = async (req, res, next) => {
  const category = await Categories.aggregate([
    {
      $match: { status: true, _id: new mongoose.Types.ObjectId(req.params.categoryId) },
    },
    { $limit: 1 },
    {
      $lookup: {
        from: MODELS.user,
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $isArray: '$categories' }, // Ensure categories is an array
                  { $in: ['$$categoryId', '$categories'] }, // Only match if categoryId is in categories
                ],
              },
            },
          },
          { $count: 'creativesCounter' },
        ],
        as: 'creativesCount',
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'relatedCategory',
        foreignField: '_id',
        as: 'relatedCategory',
      },
    },
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
        trend: 1,
        creativesCounter: { $arrayElemAt: ['$creativesCount.creativesCounter', 0] },
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
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        insurance: { $ifNull: ['$insurance', false] },
        media: 1,
        __v: 1,
        image: { $concat: [process.env.BUCKET_HOST, '/', '$image'] },
        relatedCategory: {
          $cond: {
            if: { $isArray: '$relatedCategory' },
            then: {
              $map: {
                input: { $ifNull: ['$relatedCategory', []] },
                as: 'related',
                in: {
                  _id: '$$related._id',
                  title: {
                    $cond: {
                      if: { $eq: ['ar', req.lang] },
                      then: '$$related.title.ar',
                      else: '$$related.title.en',
                    },
                  },
                  image: {
                    $cond: {
                      if: '$$related.image',
                      then: { $concat: [process.env.BUCKET_HOST, '/', '$$related.image'] },
                      else: null,
                    },
                  },
                  subCategories: {
                    $cond: {
                      if: { $isArray: '$$related.subCategories' },
                      then: {
                        $map: {
                          input: { $ifNull: ['$$related.subCategories', []] },
                          as: 'subCat',
                          in: {
                            _id: '$$subCat._id',
                            title: {
                              $cond: {
                                if: { $eq: ['ar', req.lang] },
                                then: '$$subCat.title.ar',
                                else: '$$subCat.title.en',
                              },
                            },
                            tags: {
                              $cond: {
                                if: { $isArray: '$$subCat.tags' },
                                then: {
                                  $map: {
                                    input: { $ifNull: ['$$subCat.tags', []] },
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
                                else: [],
                              },
                            },
                          },
                        },
                      },
                      else: [],
                    },
                  },
                },
              },
            },
            else: [],
          },
        },
      },
    },
  ]);

  if (category.length === 0)
    return next(new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang));
  res.status(200).json({ message: 'success', data: category[0] });
};
