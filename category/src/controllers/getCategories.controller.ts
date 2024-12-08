import { Categories, MODELS } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { GetCategoriesHandler } from '../types/endpoints/endpoints';

// get categories
export const getCategoriesPagination: RequestHandler<unknown, unknown, unknown, {
  search?: string;
  title?: string;
  cycle?: string;
  status?: boolean;
}> = async (req, res, next) => {
  
  req.pagination.filter = {status:true};

  
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');

    req.pagination.filter.$or = [
      { 'title.ar': searchRegex }, 
      { 'title.en': searchRegex }, 
      { 'jobTitles.ar': searchRegex }, 
      { 'jobTitles.en': searchRegex }, 
      { 'subCategories.title.ar': searchRegex }, 
      { 'subCategories.title.en': searchRegex }, 
      { 'tags.ar': searchRegex }, 
      { 'tags.en': searchRegex }, 
      { 'cycle': searchRegex },
    ];
  }
  if (req.query.title) {
    
    const titleField = `title.${req.lang || 'en'}`; 
    req.pagination.filter[titleField] = req.query.title;
  }
  if (req.query.cycle) {
    req.pagination.filter.cycle = req.query.cycle;
  }
  next();
};



export const getCategoriesHandler: GetCategoriesHandler = async (req, res) => {  
  
  const category = await Categories.aggregate([
    { $match: {...req.pagination.filter , isRelated:false} },
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
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
        as: 'relatedCategory'
      }
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
                      else: '$$related.title.en'
                    }
                  },
                  image: { 
                    $cond: {
                      if: '$$related.image',
                      then: { $concat: [process.env.BUCKET_HOST, '/', '$$related.image'] },
                      else: null
                    }
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
                                else: '$$subCat.title.en'
                              }
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
                                          else: '$$tag.en'
                                        }
                                      }
                                    }
                                  }
                                },
                                else: []
                              }
                            }
                          }
                        }
                      },
                      else: []
                    }
                  }
                }
              }
            },
            else: []
          }
        }
      },
    },
  ]);
  
  
  const resultCount = await Categories.find(req.pagination.filter).countDocuments();

  res.status(200).json({ 
    message: 'success',
    pagination:{
      currentPage:req.pagination.page,
      resultCount,
      totalPages:Math.ceil(resultCount/req.pagination.limit)
    },
    data: category
  });
};
