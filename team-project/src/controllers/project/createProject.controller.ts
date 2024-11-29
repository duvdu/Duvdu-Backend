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
  MODELS,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateProjectHandler } from '../../types/project.endpoints';
// import { pendingQueue } from '../../utils/expirationQueue';

export const createProjectHandler: CreateProjectHandler = async (req, res) => {
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };

  const s3 = new Bucket();
  
  // Handle cover upload in parallel with other operations
  const coverUploadPromise = s3.saveBucketFiles(FOLDERS.team_project, ...files['cover'])
    .then(() => {
      req.body.cover = `${FOLDERS.team_project}/${files['cover'][0].filename}`;
      Files.removeFiles(req.body.cover);
    });

  // Validate categories and users first
  const validationPromises = req.body.creatives.map(async (creative) => {
    if (!(await Categories.findById(creative.category))) {
      throw new BadRequestError({ en: 'invalid category', ar: 'فئة غير صالحة' }, req.lang);
    }
    
    if (creative.users?.length) {
      await Promise.all(creative.users.map(async (user) => {
        if (!(await Users.findById(user.user))) {
          throw new BadRequestError({ en: 'invalid users', ar: 'المستخدمين غير الصالحين' }, req.lang);
        }
      }));
    }
  });

  // Handle all file uploads in parallel
  const uploadPromises = req.body.creatives.map(async (creative, creativeIndex) => {
    if (creative.users?.length) {
      await Promise.all(creative.users.map(async (user, userIndex) => {
        user.attachments = [];
        const key = `creatives[${creativeIndex}][users][${userIndex}][attachments]`;
        
        if (key?.length && Array.isArray(files[key])) {
          await s3.saveBucketFiles(FOLDERS.team_project, ...files[key]);
          
          files[key].forEach((file) => {
            const filePath = `${FOLDERS.team_project}/${file.filename}`;
            user.attachments.push(filePath);
            Files.removeFiles(filePath);
          });
        }
      }));
    }
  });

  // Wait for all operations to complete
  await Promise.all([
    coverUploadPromise,
    ...validationPromises,
    ...uploadPromises
  ]);

  // Calculate deadlines and total amounts
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

  // Create team project
  const team = await TeamProject.create({
    ...req.body,
    user: req.loggedUser?.id,
  });

  // Create contracts and send notifications
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
        totalPrice: user.totalAmount,
        attachments: user.attachments,
        cycle: CYCLES.teamProject,
        stageExpiration,
        category: creative.category,
      });

      // create contract in all contracts
      await Contracts.create({
        _id: contract._id,
        contract: contract._id,
        customer: contract.customer,
        sp: contract.sp,
        cycle: CYCLES.teamProject,
        ref: MODELS.teamContract,
      });

      const customer = await Users.findById(req.loggedUser.id);
      // send notifications in parallel
      await Promise.all([
        sendNotification(
          contract.customer.toString(),
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'team project new contract',
          `new team project contract from ${customer?.name}`,
          Channels.new_contract,
        ),
        sendNotification(
          contract.customer.toString(),
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'team project new contract',
          'your team project contract created successfully',
          Channels.new_contract,
        ),
      ]);

      // TODO: use pending expiration
      // const delay = contract.stageExpiration * 3600 * 1000;
      // pendingQueue.add({contractId:contract._id.toString() , lang:req.lang} , {delay});
    }
  }

  res.status(201).json({ message: 'success', data: team });
};
