import 'express-async-errors';

import { TeamProject } from '@duvdu-v1/duvdu';

import { GetProjectsCrmHandler } from '../../types/endpoints';



export const getProjectsCrmHandler : GetProjectsCrmHandler = async(req,res)=>{
  const projects = await TeamProject.find({...req.pagination.filter})
    .populate([
      {path:'user' , select:'isOnline profileImage username'},
      {path:'creatives.users.user' , select:'isOnline profileImage username'}
    ]).sort({createdAt: -1}).limit(req.pagination.limit).skip(req.pagination.skip);

  const resultCount = await TeamProject.find({...req.pagination.filter}).countDocuments();

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