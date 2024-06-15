import { MODELS, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Rentals } from '../../models/rental.model';

export const getProjectsHandler: RequestHandler = async (req, res) => {
  const pipelines = [
    {
      $set: {
        subCategory: {
          $cond: {
            if: {
              $eq: [req.lang, 'en'],
            },
            then: '$subCategory.en',
            else: '$subCategory.ar',
          },
        },
        tags: {
          $cond: {
            if: {
              $eq: [req.lang, 'en'],
            },
            then: '$tags.en',
            else: '$tags.ar',
          },
        },
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $set: {
        category: {
          _id: '$categoryDetails._id',
          image: { $concat: [process.env.BUCKET_HOST, '$categoryDetails.image'] },
          title: {
            $cond: {
              if: { $eq: [req.lang, 'ar'] },
              then: '$categoryDetails.title.ar',
              else: '$categoryDetails.title.en',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '$userDetails.profileImage'],
          },
          cover: {
            $concat: [process.env.BUCKET_HOST, '$userDetails.cover'],
          },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '$$attachment'],
            },
          },
        },
        cover: {
          $concat: [process.env.BUCKET_HOST, '$cover'],
        },
      },
    },
    {
      $unset: 'userDetails',
    },
  ];

  const resultCount = await Rentals.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });

  const projects = await Rentals.aggregate([
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
      },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    ...pipelines,
  ]);

  if (req.loggedUser?.id) {
    const user = await Users.findById(req.loggedUser.id, { favourites: 1 });

    projects.forEach((project) => {
      project.isFavourite = user?.favourites.some(
        (el: any) => el.project.toString() === project._id.toString(),
      );
    });
  }

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: projects,
  });
};

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    location?: { lat: number; lng: number };
    equipments?: string[];
    category?: string;
    pricePerHourFrom?: number;
    pricePerHourTo?: number;
    insurance?: number;
    showOnHome?: boolean;
    startDate?: Date;
    endDate?: Date;
    tags?: string;
    subCategory?: string;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords) {
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword) => ({
      desc: { $regex: keyword, $options: 'i' },
    }));
  }
  if (req.query.location) {
    req.pagination.filter.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [req.query.location.lng, req.query.location.lat],
        },
      },
    };
  }
  if (req.query.equipments) {
    req.pagination.filter['equipments.name'] = { $in: req.query.equipments };
  }
  if (req.query.category) {
    req.pagination.filter.category = req.query.category;
  }
  if (req.query.pricePerHourFrom || req.query.pricePerHourTo) {
    req.pagination.filter.pricePerHour = {};
    if (req.query.pricePerHourFrom) {
      req.pagination.filter.pricePerHour.$gte = req.query.pricePerHourFrom;
    }
    if (req.query.pricePerHourTo) {
      req.pagination.filter.pricePerHour.$lte = req.query.pricePerHourTo;
    }
  }
  if (req.query.insurance) {
    req.pagination.filter.insurance = req.query.insurance;
  }
  if (req.query.showOnHome !== undefined) {
    req.pagination.filter.showOnHome = req.query.showOnHome;
  }
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  if (req.query.subCategory) {
    req.pagination.filter[`subCategory.${req.lang}`] = req.query.subCategory;
  }
  if (req.query.tags) {
    req.pagination.filter['tags.' + req.lang] = req.query.tags;
  }
  next();
};
