import 'express-async-errors';

import { Notification } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { GetNotificationsCrmHandler } from '../../types/endpoints/notification.endpoint';


export const getNotificationsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    sourceUser?: string;
    targetUser?: string;
    type?: string;
    target?: string;
    watched?: boolean;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }
> = (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.sourceUser) req.pagination.filter.sourceUser = req.query.sourceUser;
  if (req.query.targetUser) req.pagination.filter.targetUser = req.query.targetUser;
  if (req.query.type) req.pagination.filter.type = req.query.type;
  if (req.query.target) req.pagination.filter.target = req.query.target;
  if (req.query.watched !== undefined) req.pagination.filter.watched = req.query.watched;
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  next();
};


export const getNotificationsCrmHandler:GetNotificationsCrmHandler = async (req,res)=>{
  const notifications = await Notification.find(req.pagination.filter)
    .limit(req.pagination.limit).skip(req.pagination.skip)
    .populate([
      {path:'sourceUser' , select:'name username profileImage'},
      {path:'targetUser' , select:'name username profileImage'},
    ]);


  const resultCount = await Notification.countDocuments(req.pagination.filter);

  res.status(200).json({
    message:'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:notifications,
  });
};