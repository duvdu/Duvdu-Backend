import {
  BadRequestError,
  Channels,
  CYCLES,
  InviteStatus,
  NotFound,
  ProjectCycle,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { sendNotification } from '../../book/sendNotification';

export const invitationActionHandler: RequestHandler<
  { projectId: string },
  SuccessResponse,
  { status: InviteStatus },
  unknown
> = async (req, res, next) => {
  const project = await ProjectCycle.findById(req.params.projectId);

  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));

  const creativeIndex = project.creatives.findIndex(
    (el) => el.creative.toString() === req.loggedUser.id,
  );
  if (creativeIndex === -1)
    return next(
      new BadRequestError(
        {
          en: 'this creative not have invitation in this project',
          ar: 'هذا المستخدم ليس لديه دعوة في هذا المشروع',
        },
        req.lang,
      ),
    );

  project.creatives[creativeIndex].inviteStatus = req.body.status;

  const user = await Users.findById(req.loggedUser.id);

  await sendNotification(
    req.loggedUser.id,
    project.user.toString(),
    project._id.toString(),
    CYCLES.portfolioPost,
    'project invitation updates',
    `${user?.name} ${
      req.body.status === InviteStatus.accepted ? 'accept' : 'reject'
    } your invitation`,
    Channels.notification,
  );

  await project.save();
  res.status(200).json({ message: 'success' });
};
