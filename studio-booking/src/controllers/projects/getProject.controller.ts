import 'express-async-errors';

import { NotFound, studioBooking, Users } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/endpoints/endpoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  const project = await studioBooking
    .findOne({
      _id: req.params.projectId,
      isDeleted: { $ne: true },
    })
    .populate([
      { path: 'user', select: 'isOnline profileImage username name rate likes about profileViews address followCount' },
      { path: 'creatives.creative', select: 'isOnline profileImage username name name rate likes about profileViews address followCount' },
    ]);

  if (!project) return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));

  if (req.loggedUser?.id) {
    const user = await Users.findById(req.loggedUser.id, { favourites: 1 });

    (project as any)._doc.isFavourite = user?.favourites.some(
      (el) => el.project.toString() === project._id.toString(),
    );
  }

  ((project as any)._doc.subCategory as any) = project.subCategory[req.lang];

  ((project as any)._doc.tags as any) = project.tags.map((tag) => tag[req.lang]);

  res.status(200).json({ message: 'success', data: project });
};
