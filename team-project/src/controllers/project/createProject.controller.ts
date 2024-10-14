import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Categories,
  Channels,
  Contracts,
  CYCLES,
  Files,
  FOLDERS,
  TeamContract,
  TeamProject,
  Users,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateProjectHandler } from '../../types/project.endpoints';
// import { pendingQueue } from '../../utils/expirationQueue';

export const createProjectHandler: CreateProjectHandler = async (req, res, next) => {
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };
  const creatives = req.body.creatives;

  const s3 = new Bucket();
  // handle cover
  await s3.saveBucketFiles(FOLDERS.team_project, ...files['cover']);
  req.body.cover = `${FOLDERS.team_project}/${files['cover'][0].filename}`;
  console.log(req.body.cover);

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
        if (key?.length && Array.isArray(files[key]))
          await s3.saveBucketFiles(FOLDERS.team_project, ...files[key]);

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
        sp: user.user,
        customer: req.loggedUser.id,
        project: team._id,
        startDate: user.startDate,
        duration: user.duration,
        workHours: user.workHours,
        hourPrice: user.hourPrice,
        deadline: user.deadLine,
        details: user.details,
        totalAmount: user.totalAmount,
        attachments: user.attachments,
        cycle: CYCLES.teamProject,
        stageExpiration,
        category: creative.category,
      });

      // create contract an all contracts
      await Contracts.create({
        _id: contract._id,
        contract: contract._id,
        customer: contract.customer,
        sp: contract.sp,
        cycle: CYCLES.teamProject,
        ref: 'team_contracts',
      });
   
      const customer = await Users.findById(req.loggedUser.id);
      // send notification to user
      await sendNotification(
        contract.customer.toString(),
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'team project new contract',
        `new team project contract from ${customer?.name}`,
        Channels.new_contract,
      );

      // TODO: use pending expiration
      // const delay = contract.stageExpiration * 3600 * 1000;
      // pendingQueue.add({contractId:contract._id.toString() , lang:req.lang} , {delay});
    }
  }

  res.status(201).json({ message: 'success', data: team });
};
