import 'express-async-errors';
import { Categories, MODELS, ProjectCycle, Rentals, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const globalSearchHandler: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  {search:string}
> = async (req, res) => {
  const searchKeyword = req.query.search || '';  
  

  const category = await Categories.aggregate([
    { $match: {$or:[
      { 'title.ar': { $regex: searchKeyword, $options: 'i' } }, 
      { 'title.en': { $regex: searchKeyword, $options: 'i' } }, 
      { 'jobTitles.ar': { $regex: searchKeyword, $options: 'i' } }, 
      { 'jobTitles.en': { $regex: searchKeyword, $options: 'i' } }, 
      { 'subCategories.title.ar': { $regex: searchKeyword, $options: 'i' } }, 
      { 'subCategories.title.en': { $regex: searchKeyword, $options: 'i' } }, 
      { 'tags.ar': { $regex: searchKeyword, $options: 'i' } }, 
      { 'tags.en': { $regex: searchKeyword, $options: 'i' } }, 
      { 'cycle': { $regex: searchKeyword, $options: 'i' } },
    ]} 
    },
    {
      $lookup: {
        from: MODELS.user,
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $isArray: '$categories' }, // Ensure categories is an array
                  { $in: ['$$categoryId', '$categories'] }, // Only match if categoryId is in categories
                ],
              },
            },
          },
          { $count: 'creativesCounter' },
        ],
        as: 'creativesCount',
      },
    },
    {
      $project: {
        title: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$title.ar',
            else: '$title.en',
          },
        },
        _id: 1,
        trend: 1,
        creativesCounter: { $arrayElemAt: ['$creativesCount.creativesCounter', 0] },
        cycle: 1,
        subCategories: {
          $map: {
            input: '$subCategories',
            as: 'subCat',
            in: {
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$subCat.title.ar',
                  else: '$$subCat.title.en',
                },
              },
              tags: {
                $map: {
                  input: '$$subCat.tags',
                  as: 'tag',
                  in: {
                    _id: '$$tag._id',
                    title: {
                      $cond: {
                        if: { $eq: ['ar', req.lang] },
                        then: '$$tag.ar',
                        else: '$$tag.en',
                      },
                    },
                  },
                },
              },
              _id: '$$subCat._id',
            },
          },
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        image: 1,
        media: 1,
        jobTitles: {
          $map: {
            input: '$jobTitles',
            as: 'title',
            in: {
              $cond: {
                if: { $eq: ['ar', req.lang] },
                then: '$$title.ar',
                else: '$$title.en',
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        image: {
          $concat: [process.env.BUCKET_HOST, '/', '$image'],
        },
      },
    },
  ]);


  const aggregationPipeline = [
    {
      $match: {
        $or: [
          { name: { $regex: searchKeyword, $options: 'i' } }, 
          { about: { $regex: searchKeyword, $options: 'i' } },      
          { username: { $regex: searchKeyword, $options: 'i' } },  
        ],
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
        coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$coverImage'] },
        about: 1,
        isOnline: 1,
        isAvaliableToInstantProjects: 1,
        pricePerHour: 1,
        hasVerificationBadge: 1,
        rate: 1,
        followCount: 1,
        invalidAddress: 1,
        likes: 1,
        address: 1,
        profileViews: 1,
        rank: 1,
        projectsView: 1,
        category: 1, // Include category field in the projection
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
    {
      $addFields: {
        category: {
          $cond: {
            if: { $gt: [{ $size: '$categoryDetails' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
              title: {
                $cond: {
                  if: { $eq: [req.lang, 'ar'] },
                  then: { $arrayElemAt: ['$categoryDetails.title.ar', 0] },
                  else: { $arrayElemAt: ['$categoryDetails.title.en', 0] },
                },
              },
            },
            else: null,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        profileImage: 1,
        coverImage: 1,
        about: 1,
        isOnline: 1,
        isAvaliableToInstantProjects: 1,
        pricePerHour: 1,
        hasVerificationBadge: 1,
        rate: 1,
        followCount: 1,
        invalidAddress: 1,
        likes: 1,
        address: 1,
        profileViews: 1,
        rank: 1,
        projectsView: 1,
        category: 1, // Include the category object
        isFollow: 1,
      },
    },
    {
      $lookup: {
        from: MODELS.follow,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$following', '$$userId'] },
                  { $eq: ['$follower', new mongoose.Types.ObjectId(req.loggedUser?.id)] },
                ],
              },
            },
          },
        ],
        as: 'isFollow',
      },
    },
    {
      $addFields: {
        isFollow: { $cond: { if: { $gt: [{ $size: '$isFollow' }, 0] }, then: true, else: false } },
      },
    },
    {
      $lookup: {
        from: MODELS.allContracts,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $eq: ['$sp', new mongoose.Types.ObjectId(req.loggedUser?.id)] },
                      { $eq: ['$customer', '$$userId'] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ['$customer', new mongoose.Types.ObjectId(req.loggedUser?.id)] },
                      { $eq: ['$sp', '$$userId'] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'canChatDetails',
      },
    },
    {
      $addFields: {
        canChat: {
          $cond: { if: { $gt: [{ $size: '$canChatDetails' }, 0] }, then: true, else: false },
        },
      },
    },
    {
      $project: {
        canChatDetails: 0, // Exclude the canChatDetails field
      },
    }
  ];
  const users = await Users.aggregate(aggregationPipeline);


  const projects = await ProjectCycle.aggregate([
    {
      $match: {
        isDeleted: false, 
        $or: [
          { name: { $regex: searchKeyword, $options: 'i' } }, 
          { description: { $regex: searchKeyword, $options: 'i' } }, 
          { searchKeyWords: { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.en': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.en': { $regex: searchKeyword, $options: 'i' } }, 
        ],
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives',
        foreignField: '_id',
        as: 'creatives',
      },
    },
    {
      $project: {
        _id: 1,
        user: {
          _id: '$user._id',
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
          isOnline: '$user.isOnline',
          username: '$user.username',
          name: '$user.name',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.coverImage'] },
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          rate: '$user.rate',
          profileViews: '$user.profileViews',
          about: '$user.about',
          isAvaliableToInstantProjects: '$user.isAvaliableToInstantProjects',
          pricePerHour: '$user.pricePerHour',
          hasVerificationBadge: '$user.hasVerificationBadge',
          likes: '$user.likes',
          followCount: '$user.followCount',
          address: '$user.address',
        },
        category: {
          title: '$category.title.' + req.lang,
          _id: '$category._id',
        },
        // subCategory: '$subCategory.' + req.lang,
        // tags: {
        //   $map: {
        //     input: '$tags',
        //     as: 'tag',
        //     in: '$$tag.' + req.lang,
        //   },
        // },
        cover: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
        audioCover: { $concat: [process.env.BUCKET_HOST, '/', '$audioCover'] },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
          },
        },
        name: 1,
        description: 1,
        tools: 1,
        functions: 1,
        creatives: {
          $map: {
            input: { $ifNull: ['$creatives', []] },
            as: 'creative',
            in: {
              _id: '$$creative._id',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.profileImage'] },
              isOnline: '$$creative.isOnline',
              username: '$$creative.username',
              name: '$$creative.name',
              rank: '$$creative.rank',
              projectsView: '$$creative.projectsView',
              coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.coverImage'] },
              acceptedProjectsCounter: '$$creative.acceptedProjectsCounter',
              rate: '$$creative.rate',
              profileViews: '$$creative.profileViews',
              about: '$$creative.about',
              isAvaliableToInstantProjects: '$$creative.isAvaliableToInstantProjects',
              pricePerHour: '$$creative.pricePerHour',
              hasVerificationBadge: '$$creative.hasVerificationBadge',
              likes: '$$creative.likes',
              followCount: '$$creative.followCount',
              address: '$$creative.address',
            },
          },
        },
        location: 1,
        address: 1,
        searchKeyWords: 1,
        duration: 1,
        showOnHome: 1,
        projectScale: 1,
        rate: 1,
        updatedAt: 1,
        createdAt: 1,
      },
    },
  ]);

  // Execute the aggregation pipeline
  const pipelines = [
    // {
    //   $set: {
    //     subCategory: {
    //       $cond: {
    //         if: { $eq: [req.lang, 'en'] },
    //         then: '$subCategory.en',
    //         else: '$subCategory.ar',
    //       },
    //     },
    //     tags: {
    //       $map: {
    //         input: '$tags',
    //         as: 'tag',
    //         in: {
    //           _id: '$$tag._id',
    //           title: {
    //             $cond: {
    //               if: { $eq: [req.lang, 'en'] },
    //               then: '$$tag.en',
    //               else: '$$tag.ar',
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
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
          image: { $concat: [process.env.BUCKET_HOST, '/', '$categoryDetails.image'] },
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
    { $unwind: '$userDetails' },
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'],
          },
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.coverImage'] },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
          profileViews: '$userDetails.profileViews',
          about: '$userDetails.about',
          isAvaliableToInstantProjects: '$userDetails.isAvaliableToInstantProjects',
          pricePerHour: '$userDetails.pricePerHour',
          hasVerificationBadge: '$userDetails.hasVerificationBadge',
          likes: '$userDetails.likes',
          followCount: '$userDetails.followCount',
          address: '$userDetails.address',
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
        cover: {
          $concat: [process.env.BUCKET_HOST, '/', '$cover'],
        },
      },
    },
    {
      $unset: ['userDetails', 'categoryDetails'],
    },
  ];

  const rentals = await Rentals.aggregate([
    {
      $match: {
        isDeleted: false, 
        $or: [
          { name: { $regex: searchKeyword, $options: 'i' } }, 
          { description: { $regex: searchKeyword, $options: 'i' } }, 
          { searchKeyWords: { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.en': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.en': { $regex: searchKeyword, $options: 'i' } }, 
        ],
      },
    },
    ...pipelines,
  ]);


  res.status(200).json(<any>{message:'success' , data:{
    users,
    rentals,
    projects,
    category
  }});
};
