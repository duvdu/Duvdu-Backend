import 'express-async-errors';
import { IstudioBooking, MODELS, PaginationResponse, studioBooking } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

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
    tags?:string;
    subCategory?:string;
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

export const getProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IstudioBooking[] }>
> = async (req, res) => {
  const resultCount = await studioBooking.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });

  const studioBookings = await studioBooking.aggregate([
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: req.pagination.limit
    },
    {
      $skip: req.pagination.skip
    },
    {
      $addFields: {
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en'
          }
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              $cond: {
                if: { $eq: ['ar', req.lang] },
                then: '$$tag.ar',
                else: '$$tag.en'
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $addFields: {
        user: {
          $cond: {
            if: { $eq: [{ $size: '$userDetails' }, 0] },
            then: null,
            else: {
              $arrayElemAt: [
                '$userDetails',
                0
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        user: {
          username: '$user.username',
          profileImage: '$user.profileImage',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name'
        },
        attachments: 1,
        cover: 1,
        studioName: 1,
        studioNumber: 1,
        studioEmail: 1,
        desc: 1,
        equipments: 1,
        location: 1,
        searchKeywords: 1,
        pricePerHour: 1,
        insurance: 1,
        showOnHome: 1,
        category: 1,
        cycle: 1,
        rate: 1,
        creatives: 1,
        tags: 1,
        subCategory: 1
      }
    }
  ]);


  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: studioBookings,
  });
};
