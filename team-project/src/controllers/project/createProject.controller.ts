import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Categories,
  Channels,
  Contracts,
  CYCLES,
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
  
  // Initialize upload promises array
  const uploadPromises: Promise<void>[] = [];

  // Handle cover upload if exists
  if (files['cover']?.[0]) {
    uploadPromises.push(
      s3.saveBucketFiles(FOLDERS.team_project, files['cover'][0])
        .then(() => {          
          req.body.cover = `${FOLDERS.team_project}/${files['cover'][0].filename}`;
        })
    );
  }

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

  // Handle attachments upload for each user
  req.body.creatives.forEach((creative, creativeIndex) => {
    if (creative.users?.length) {
      creative.users.forEach((user, userIndex) => {
        user.attachments = [];
        const key = `creatives[${creativeIndex}][users][${userIndex}][attachments]`;
        
        if (files[key]?.length) {
          uploadPromises.push(
            s3.saveBucketFiles(FOLDERS.team_project, ...files[key])
              .then(() => {
                files[key].forEach((file) => {
                  user.attachments.push(`${FOLDERS.team_project}/${file.filename}`);
                });
              })
          );
        }
      });
    }
  });

  // Wait for all validations and uploads to complete
  await Promise.all([
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

  // Create contracts and send notifications in parallel
  const contractPromises = team.creatives.flatMap((creative) =>
    creative.users.map(async (user) => {
      const stageExpiration = await getBestExpirationTime(
        new Date(
          new Date(user.startDate).setDate(
            new Date(user.startDate).getDate() + Number(user.duration / 2),
          ),
        ).toString(),
        req.lang,
      );

      // Create contract
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

      // Create contract in all contracts
      await Contracts.create({
        _id: contract._id,
        contract: contract._id,
        customer: contract.customer,
        sp: contract.sp,
        cycle: CYCLES.teamProject,
        ref: MODELS.teamContract,
      });

      const customer = await Users.findById(req.loggedUser.id);
      
      // Send notifications
      return Promise.all([
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
    })
  );

  // Wait for all contracts and notifications to be created
  await Promise.all(contractPromises);

  res.status(201).json({ message: 'success', data: team });
};
