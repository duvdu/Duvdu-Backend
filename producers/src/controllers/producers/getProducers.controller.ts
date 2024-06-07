import 'express-async-errors';

import { Producer } from '@duvdu-v1/duvdu';

import { GetProducersHandler } from '../../types/endpoints';


export const getProducersHandler:GetProducersHandler = async (req , res)=>{
  const producers = await Producer.find()
    .populate([{path:'user' , select:'isOnline profileImage username name  rate likes about profileViews address followCount acceptedProjectsCounter'}])
    .skip(req.pagination.skip).limit(req.pagination.limit).sort({ createdAt: -1 });

  const resultCount = await Producer.find().countDocuments();


  res.status(200).json({
    message:'success' ,
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:producers
  });
};