import { IPage, NotFound, Pages, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmPageController: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IPage }>
> = async (req, res) => {
  const page = await Pages.findById(req.params.id);

  if (!page) throw new NotFound({ ar: 'الصفحة غير موجودة', en: 'Page not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: page,
  });
};
