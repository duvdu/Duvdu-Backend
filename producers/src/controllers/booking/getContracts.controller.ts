import 'express-async-errors';

import { ProducerBooking } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { GetContractsHandler } from '../../types/endpoints';


export const getContractsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    location?: { lat: number; lng: number };
    platform?: string;
    cycle?: string;
    episodes?: number;
    episodeduration?: number;
    status?: ('pending' | 'accepted' | 'rejected' | 'appoinment pending' | 'appoinment accepted' | 'appoinment rejected')[];
    appoinmentDate?: string;
    user?: Types.ObjectId;
    producer?:Types.ObjectId;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords) {
    req.pagination.filter.$or = req.query.searchKeywords.map(keyword => ({
      details: { $regex: keyword, $options: 'i' },
    }));
  }
  if (req.query.location) {
    req.pagination.filter['appoinment.location.lat'] = req.query.location.lat;
    req.pagination.filter['appoinment.location.lng'] = req.query.location.lng;
  }
  if (req.query.platform) {
    req.pagination.filter.platform = req.query.platform;
  }
  if (req.query.cycle) {
    req.pagination.filter.cycle = req.query.cycle;
  }
  if (req.query.episodes) {
    req.pagination.filter.episodes = req.query.episodes;
  }
  if (req.query.episodeduration) {
    req.pagination.filter.episodeduration = req.query.episodeduration;
  }
  if (req.query.status) {
    req.pagination.filter.status = { $in: req.query.status };
  }
  if (req.query.appoinmentDate) {
    req.pagination.filter['appoinment.date'] = req.query.appoinmentDate;
  }
  if (req.query.user) {
    req.pagination.filter.user = req.query.user;
  }
  if (req.query.producer) {
    req.pagination.filter.producer = req.query.producer;
  }

  next();
};

export const getContractsHandler:GetContractsHandler = async (req,res)=>{
  const contracts = await ProducerBooking.find(req.pagination.filter).populate([
    {path:'user' , select:'profileImage username location rate name'},
    {path:'producer' , select:'profileImage username location rate name'}
  ]).limit(req.pagination.limit).skip(req.pagination.skip).sort({ createdAt: -1 });

  const resultCount = await ProducerBooking.find(req.pagination.filter).countDocuments();
  res.status(200).json({
    message:'success' ,
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:contracts});
};