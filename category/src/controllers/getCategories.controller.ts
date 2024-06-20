import { Categories } from '@duvdu-v1/duvdu';
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

  // const category = await Categories.aggregate([
  //   { $match: req.pagination.filter },
  //   {$skip:req.pagination.skip},
  //   {$limit:req.pagination.limit},
  //   {
  //     $project: {
  //       title: {
  //         $cond: {
  //           if: { $eq: ['ar', req.lang] },
  //           then: '$title.ar',
  //           else: '$title.en',
  //         },
  //       },
  //       _id: 1,
  //       creativesCounter: 1,
  //       cycle: 1,
  //       subCategories: {
  //         $map: {
  //           input: '$subCategories',
  //           as: 'subCat',
  //           in: {
  //             title: {
  //               $cond: {
  //                 if: { $eq: ['ar', req.lang] },
  //                 then: '$$subCat.title.ar',
  //                 else: '$$subCat.title.en',
  //               },
  //             },
  //             tags: {
  //               $map: {
  //                 input: '$$subCat.tags',
  //                 as: 'tag',
  //                 in: {
  //                   $cond: {
  //                     if: { $eq: ['ar', req.lang] },
  //                     then: '$$tag.ar',
  //                     else: '$$tag.en',
  //                   },
  //                 },
  //               },
  //             },
  //             _id: '$$subCat._id',
  //           },
  //         },
  //       },
  //       status: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //       __v: 1,
  //       image: 1,
  //       jobTitles: {
  //         $map: {
  //           input: '$jobTitles',
  //           as: 'title',
  //           in: {
  //             $cond: {
  //               if: { $eq: ['ar', req.lang] },
  //               then: '$$title.ar',
  //               else: '$$title.en',
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       image: {
  //         $concat: [process.env.BUCKET_HOST, '/', '$image']
  //       }
  //     }
  //   },
  // ]);
  
  const category = await Categories.aggregate([
    { $match: req.pagination.filter },
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
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
                    id: '$$tag._id',
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
