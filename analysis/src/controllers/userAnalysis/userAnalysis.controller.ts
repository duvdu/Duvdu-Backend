import { MODELS, ProjectView, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';



export const userAnalysisHandler:
RequestHandler<unknown , SuccessResponse , unknown , unknown> = async (req,res)=>{
  // const userId = '66633b9ae929f30e28756982';
  const userId = req.loggedUser.id;
  const userData = await Users.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) }
    },
    {
      $project: {
        profileViews: 1,
        likes: 1,
        rank: 1,
        projectsView: 1,
        category:1
      }
    }
  ]
  );


  // get project views analysis
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const result = await ProjectView.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneYearAgo, $lte: now }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalViews: { $sum: '$count' }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  const userProjectViews =  result.map(item => ({
    year: item._id.year,
    month: item._id.month,
    totalViews: item.totalViews
  }));


  // get top project views
  const projectViews = await ProjectView.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$project',
        totalViews: { $sum: '$count' },
        ref: { $first: '$ref' }
      }
    },
    {
      $sort: {
        totalViews: -1
      }
    },
    {
      $limit: 3
    },
    {
      $lookup: {
        from: MODELS.portfolioPost, 
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [
                { $eq: ['$_id', '$$projectId'] },
                { $eq: ['$$ref', MODELS.portfolioPost] }
              ]}
            }
          }
        ],
        as: 'portfolioPostDetails'
      }
    },
    {
      $lookup: {
        from: 'rentals',
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [
                { $eq: ['$_id', '$$projectId'] },
                { $eq: ['$$ref', 'rentals'] }
              ]}
            }
          }
        ],
        as: 'studioBookingDetails'
      }
    },
    {
      $unwind: {
        path: '$portfolioPostDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$studioBookingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        projectDetails: {
          $cond: {
            if: { $eq: ['$ref', MODELS.portfolioPost] },
            then: '$portfolioPostDetails',
            else: '$studioBookingDetails'
          }
        }
      }
    },
    {
      $addFields: {
        'projectDetails.cover': {
          $concat: [process.env.BUCKET_HOST, '/', '$projectDetails.cover']
        },
        'projectDetails.attachments': {
          $map: {
            input: '$projectDetails.attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment']
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        totalViews: 1,
        projectDetails: 1 
      }
    }
  ]);

  const topProjectViews =  projectViews.map(item => ({
    projectId: item._id,
    totalViews: item.totalViews,
    projectDetails: item.projectDetails
  }));




  res.status(200).json(<any>{
    message:'success',
    data:{
      userData,
      userProjectViews,
      topProjectViews
    }
  });
    
};