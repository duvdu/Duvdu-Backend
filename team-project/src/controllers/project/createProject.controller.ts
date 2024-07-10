import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Categories,
  Channels,
  CYCLES,
  Files,
  FOLDERS,
  NotificationDetails,
  NotificationType,
  Users,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { TeamContract, TeamProject } from '../../models/teamProject.model';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateProjectHandler } from '../../types/project.endpoints';
import { pendingQueue } from '../../utils/expirationQueue';

export const createProjectHandler: CreateProjectHandler = async (req, res, next) => {
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };
  const creatives = req.body.creatives;

  const s3 = new Bucket();
  // handle cover
  await s3.saveBucketFiles(FOLDERS.team_project, ...files['cover']);
  req.body.cover = `${FOLDERS.team_project}/${files['cover'][0].filename}`;
  Files.removeFiles(req.body.cover);

  // validate user and upload attachments
  for (const creative of req.body.creatives) {
    if (!(await Categories.findById(creative.category)))
      return next(new BadRequestError({ en: 'invalid category', ar: 'فئة غير صالحة' }, req.lang));
    if (creative.users?.length) {
      for (const user of creative.users) {
        if (!(await Users.findById(user.user)))
          return next(
            new BadRequestError({ en: 'invalid users', ar: 'المستخدمين غير الصالحين' }, req.lang),
          );

        user.attachments = [];
        const key = `creatives[${creatives.indexOf(creative)}][users][${creative.users.indexOf(user)}][attachments]`;
        if (key?.length) await s3.saveBucketFiles(FOLDERS.team_project, ...files[key]);

        for (let i = 0; i < key.length; i++) {
          const fileArray = files[key];
          if (fileArray && fileArray[i]) {
            user.attachments.push(`${FOLDERS.team_project}/${fileArray[i].filename}`);
            Files.removeFiles(`${FOLDERS.team_project}/${fileArray[i].filename}`);
          }
        }
      }
    }
  }

  req.body.creatives.forEach((creative) => {
    creative.users?.forEach((user) => {
      user.deadLine = new Date(
        new Date(user.startDate).setDate(
          new Date(user.startDate).getDate() + Number(user.duration),
        ),
      );
      user.totalAmount = user.workHours * user.hourPrice;
    });
  });

  const team = await TeamProject.create({
    ...req.body,
    user: req.loggedUser?.id,
  });

  for (const creative of team.creatives) {
    for (const user of creative.users) {
      const stageExpiration = await getBestExpirationTime(
        new Date(
          new Date(user.startDate).setDate(
            new Date(user.startDate).getDate() + Number(user.duration / 2),
          ),
        ).toString(),
        req.lang,
      );

      // create contract
      const contract = await TeamContract.create({
        sp: req.loggedUser?.id,
        customer: user.user,
        project: team._id,
        startDate: user.startDate,
        duration: user.duration,
        workHours: user.workHours,
        hourPrice: user.hourPrice,
        deadLine: user.deadLine,
        details: user.details,
        totalAmount: user.totalAmount,
        actionAt: new Date(),
        cycle: CYCLES.teamProject,
        stageExpiration,
      });

      // send notification to user
      await sendNotification(
        contract.sp.toString(),
        contract.customer.toString(),
        contract._id.toString(),
        NotificationType.new_team_contract,
        NotificationDetails.newTeamContract.title,
        NotificationDetails.newTeamContract.message,
        Channels.new_contract,
      );

      // use pending expiration
      const delay = contract.stageExpiration * 3600 * 1000;
      pendingQueue.add({contractId:contract._id.toString()} , {delay});
    }
  }

  res.status(201).json({ message: 'success', data: team });
};
