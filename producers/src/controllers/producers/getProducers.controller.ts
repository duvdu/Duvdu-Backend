import 'express-async-errors';

import { Producer } from '@duvdu-v1/duvdu';

import { GetProducersHandler } from '../../types/endpoints';


export const getProducersHandler:GetProducersHandler = async (req , res)=>{
  const producers = await Producer.find()
    .populate([{path:'user' , select:'profileImage username location rate'}])
    .limit(req.pagination.limit).skip(req.pagination.skip).sort({ createdAt: -1 });

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