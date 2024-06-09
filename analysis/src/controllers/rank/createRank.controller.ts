import 'express-async-errors';

import { Rank } from '@duvdu-v1/duvdu';

import { CreateRankHandler } from '../../types/endpoints/rank.endpoints';



export const createRankHandler:CreateRankHandler = async (req,res)=>{
  const rank = await Rank.create(req.body);
  res.status(201).json({message:'success' , data:rank});
};