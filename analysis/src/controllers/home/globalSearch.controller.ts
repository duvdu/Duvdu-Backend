import { CopyRights, Producer, ProjectCycle, Rentals, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const globalSearchHandler: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  {search:string}
> = async (req, res) => {
  const searchKeyword = req.query.search || '';

  const users= await Users.aggregate([
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
        username: 1,
        name: 1,
        profileImage: {
          $cond: {
            if: { $eq: ['$profileImage', null] },
            then: null,
            else: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
          },
        },
      },
    },
  ]);




  const projectCycles = await ProjectCycle.aggregate( [
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
      $project: {
        _id: 1, 
        name: 1, 
        description: 1,
        cover: {
          $cond: {
            if: { $eq: ['$cover', null] },
            then: null,
            else: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
          },
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $cond: {
                if: { $eq: ['$$attachment', null] },
                then: null,
                else: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
              },
            },
          },
        },
      },
    }
  ]);



  // Execute the aggregation pipeline
  const rentals = await Rentals.aggregate( [
    {
      $match: {
        isDeleted: false, 
        $or: [
          { title: { $regex: searchKeyword, $options: 'i' } }, 
          { description: { $regex: searchKeyword, $options: 'i' } }, 
          { searchKeywords: { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'subCategory.en': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.ar': { $regex: searchKeyword, $options: 'i' } }, 
          { 'tags.en': { $regex: searchKeyword, $options: 'i' } }, 
        ],
      },
    },
    {
      $project: {
        _id: 0, 
        title: 1,
        description: 1, 
        cover: {
          $cond: {
            if: { $eq: ['$cover', null] },
            then: null,
            else: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
          },
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $cond: {
                if: { $eq: ['$$attachment', null] },
                then: null,
                else: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
              },
            },
          },
        },
      },
    }
  ]);



  const producers = await Producer.aggregate([
    {
      $match: {
        $or: [
          { searchKeywords: { $regex: searchKeyword, $options: 'i' } },
          { 'subCategories.title.ar': { $regex: searchKeyword, $options: 'i' } },
          { 'subCategories.title.en': { $regex: searchKeyword, $options: 'i' } },
          { 'subCategories.tags.ar': { $regex: searchKeyword, $options: 'i' } },
          { 'subCategories.tags.en': { $regex: searchKeyword, $options: 'i' } },
        ],
      },
    },
    {
      $project: {
        _id:1,
        minBudget: 1,
        maxBudget: 1,
        subCategories: {
          $map: {
            input: {
              $filter: {
                input: '$subCategories',
                as: 'subCategory',
                cond: {
                  $or: [
                    { $regexMatch: { input: '$$subCategory.title.ar', regex: searchKeyword, options: 'i' } }, // Filter by Arabic title
                    { $regexMatch: { input: '$$subCategory.title.en', regex: searchKeyword, options: 'i' } }, // Filter by English title
                    { $regexMatch: { input: '$$subCategory.tags.ar', regex: searchKeyword, options: 'i' } }, // Filter by Arabic tags
                    { $regexMatch: { input: '$$subCategory.tags.en', regex: searchKeyword, options: 'i' } }, // Filter by English tags
                  ],
                },
              },
            },
            as: 'filteredSubCategory',
            in: {
              title: '$$filteredSubCategory.title', 
              tags: '$$filteredSubCategory.tags', 
            },
          },
        },
      },
    },
  ]);



  const copyRights = await CopyRights.aggregate([
    {
      $match: {
        $text: { $search: searchKeyword }, 
      },
    },
    {
      $project: {
        _id: 1,
        user: 1,
        category: 1,
        price: 1,
        duration: 1,
        address: 1,
        searchKeywords: 1,
        showOnHome: 1,
        cycle: 1,
        isDeleted: 1,
        rate: 1,
        tags: 1,
        subCategory: 1,
        location: 1,
      },
    }
  ]);

  res.status(200).json(<any>{message:'success' , data:{
    users,
    projectCycles,
    rentals,
    producers,
    copyRights,
  }});
};
