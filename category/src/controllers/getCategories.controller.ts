import { Categories } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { GetCategoriesHandler } from '../types/endpoints/endpoints';


export const getCategoriesPagination: RequestHandler<unknown, unknown, unknown, {
  search?: string;
  title?: string;
  cycle?: string;
  status?: boolean;
}> = async (req, res, next) => {
  
  req.pagination.filter = {status:true};

  
  if (req.query.search) {
   
    req.pagination.filter.$text = { $search: req.query.search };
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
    { $match: req.pagination.filter },
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
  ]);

  res.status(200).json({ message: 'success', data: category });
};
