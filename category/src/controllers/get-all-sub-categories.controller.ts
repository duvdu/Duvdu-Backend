import { Categories, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getAllSubCategories: RequestHandler<unknown, SuccessResponse<{ data: any }>> = async (
  req,
  res,
) => {
  const categories = await Categories.aggregate([
    { $match: { status: true } },
    { $project: { subCategories: 1 } },
    { $unwind: '$subCategories' },
    {
      $project: {
        title: {
          $cond: {
            if: { $eq: [req.lang, 'ar'] },
            then: '$subCategories.title.ar',
            else: '$subCategories.title.en',
          },
        },
        tags: {
          $map: {
            input: '$subCategories.tags',
            as: 'tag',
            in: {
              $cond: {
                if: { $eq: [req.lang, 'ar'] },
                then: '$$tag.ar',
                else: '$$tag.en',
              },
            },
          },
        },
      },
    },
  ]);

  res.json({ message: 'success', data: categories });
};
