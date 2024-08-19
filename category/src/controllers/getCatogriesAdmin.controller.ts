import { Categories } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { GetCatogriesAdminHandler } from '../types/endpoints/endpoints';

export const getCategoriesAdminPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    title?: string;
    cycle?: string;
    status?: boolean;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

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
  if (req.query.status !== undefined) {
    req.pagination.filter.status = req.query.status;
  }
  next();
};

export const getCatogriesAdminHandler: GetCatogriesAdminHandler = async (req, res) => {
  

  const category = await Categories.aggregate([
    { $match: req.pagination.filter },
    {$skip:req.pagination.skip},
    {$limit:req.pagination.limit},
    {
      $project: {
        title: 1,
        _id: 1,
        creativesCounter: 1,
        cycle: 1,
        subCategories: 1,
        status: 1,
        media:1,
        trend:1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        image: 1,
        jobTitles: 1,
      },
    },
    {
      $addFields: {
        image: {
          $concat: [process.env.BUCKET_HOST, '/', '$image'],
        },
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
    data: category });
};
