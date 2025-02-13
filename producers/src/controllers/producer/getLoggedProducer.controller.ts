import 'express-async-errors';

import { ContractStatus, MODELS, NotFound, Producer } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetLoggedProducerHandler } from '../../types/endpoints';

export const getLoggedProducerHandler: GetLoggedProducerHandler = async (req, res, next) => {
  const producers = await Producer.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.loggedUser.id) },
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
      $set: {
        category: {
          _id: '$category._id',
          image: { $concat: [process.env.BUCKET_HOST, '/', '$category.image'] },
          title: {
            $cond: {
              if: { $eq: [req.lang, 'ar'] },
              then: '$category.title.ar',
              else: '$category.title.en',
            },
          },
        },
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
        from: MODELS.producerPlatforms,
        localField: 'platforms',
        foreignField: '_id',
        as: 'platforms',
      },
    },
    {
      $lookup: {
        from: MODELS.producerContract,
        let: { producerId: '$user._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$producer', '$$producerId'] },
              status: {
                $nin: [ContractStatus.rejected, ContractStatus.accepted, ContractStatus.canceled]
              }
            }
          }
        ],
        as: 'activeContracts'
      }
    },
    {
      $project: {
        _id: 1,
        subCategories: {
          $cond: {
            if: { $isArray: '$subCategories' },
            then: {
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
                    $cond: {
                      if: { $isArray: '$$subCat.tags' },
                      then: {
                        $map: {
                          input: '$$subCat.tags',
                          as: 'tag',
                          in: {
                            title: {
                              $cond: {
                                if: { $eq: ['ar', req.lang] },
                                then: '$$tag.ar',
                                else: '$$tag.en',
                              },
                            },
                            _id: '$$tag._id',
                          },
                        },
                      },
                      else: [],
                    },
                  },
                  _id: '$$subCat._id',
                },
              },
            },
            else: [],
          },
        },
        canEdit: { $eq: [{ $size: '$activeContracts' }, 0] },
        platforms: {
          $map: {
            input: '$platforms',
            as: 'platform',
            in: {
              _id: '$$platform._id',
              name: {
                $cond: {
                  if: { $eq: [req.lang, 'ar'] },
                  then: '$$platform.name.ar',
                  else: '$$platform.name.en',
                },
              },
              image: { $concat: [process.env.BUCKET_HOST, '/', '$$platform.image'] },
            },
          },
        },
        minBudget: 1,
        maxBudget: 1,
        searchKeywords: 1,
        createdAt: 1,
        updatedAt: 1,
        'category._id': 1,
        'category.title': 1,
        user: {
          profileImage: {
            $cond: [
              { $eq: ['$user.profileImage', null] },
              null,
              { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
            ],
          },
          username: '$user.username',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          name: '$user.name',
          rate: '$user.rate',
          rank: '$user.rank',
          projectsView: '$user.projectsView',
          address: '$user.address',
        },
      },
    },
  ]);
  if (producers.length == 0)
    return next(
      new NotFound({ en: 'producer not found', ar: 'لم يتم العثور على المنتج' }, req.lang),
    );

  res.status(200).json({ message: 'success', data: producers[0] });
};
