import { IPage, Pages, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createPageController: RequestHandler<
  unknown,
  SuccessResponse<{ data: IPage }>,
  Pick<IPage, 'title' | 'content' | 'type'>
> = async (req, res) => {
  const page = await Pages.create(req.body);
  res.status(201).json({
    message: 'success',
    data: page,
  });
};
