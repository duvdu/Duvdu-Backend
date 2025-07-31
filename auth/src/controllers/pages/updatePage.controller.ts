import { IPage, NotFound, Pages, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updatePageController: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IPage }>,
  Partial<Pick<IPage, 'title' | 'content' | 'type'>>
> = async (req, res) => {
  const page = await Pages.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!page) throw new NotFound({ ar: 'الصفحة غير موجودة', en: 'Page not found' }, req.lang);

  res.status(200).json({
    message: 'success',
    data: page,
  });
};
