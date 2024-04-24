import 'express-async-errors';
import { IstudioBooking, PaginationResponse, studioBooking } from '@duvdu-v1/duvdu';
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
  const studioBookings = await studioBooking
    .find({
      ...req.pagination.filter,
      isDeleted: { $ne: true },
    })
    .sort('-createdAt')
    .limit(req.pagination.limit)
    .skip(req.pagination.skip);

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
