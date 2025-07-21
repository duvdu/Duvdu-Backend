import { NotFound, Pages } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deletePageController: RequestHandler<{ id: string }, unknown, unknown> = async (
  req,
  res,
) => {
  const page = await Pages.findByIdAndDelete(req.params.id);

  if (!page) throw new NotFound({ ar: 'الصفحة غير موجودة', en: 'Page not found' }, req.lang);

  res.status(204).send();
};
