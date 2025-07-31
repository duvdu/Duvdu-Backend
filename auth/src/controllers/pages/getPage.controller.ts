import { IPage, NotFound, Pages, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const getPageController: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IPage }>
> = async (req, res) => {
  const page = await Pages.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $project: {
        _id: 1,
        title: `$title.${req.lang}`,
        content: `$content.${req.lang}`,
        type: 1,
      },
    },
  ]);

  if (page.length === 0)
    throw new NotFound({ ar: 'الصفحة غير موجودة', en: 'Page not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: page[0],
  });
};
