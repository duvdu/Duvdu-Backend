import 'express-async-errors';

import {
  Bucket,
  Channels,
  Contracts,
  CYCLES,
  FOLDERS,
  NotAllowedError,
  NotFound,
  TeamContract,
  TeamProject,
  Users,
  UserStatus,
  MODELS,
} from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { sendNotification } from './sendNotification';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { AddCreativeHandler } from '../../types/project.endpoints';

export const addCreativeHandler: AddCreativeHandler = async (req, res, next) => {
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };
  
  // Start file upload early and in parallel with other operations
  let uploadPromise;
  if (files['attachments']?.length) {
    const s3 = new Bucket();
    uploadPromise = s3.saveBucketFiles(FOLDERS.team_project, ...files['attachments'])
      .then(() => {
        req.body.attachments = files['attachments'].map(
          (file) => `${FOLDERS.team_project}/${file.filename}`
        );
      });
  }

  // Run database queries in parallel
  const [project, creative] = await Promise.all([
    TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } }),
    Users.findById(req.body.user)
  ]);

  if (!project)
    return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }, req.lang));

  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  if (!creative)
    return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang));

  const index = project.creatives.findIndex(
    (creative) => creative.category.toString() === req.body.category,
  );

  if (index === -1)
    return next(
      new NotFound(
        { en: 'category not found in team', ar: 'الفئة غير موجودة في الفريق' },
        req.lang,
      ),
    );

  // Wait for file upload to complete if there were attachments
  if (uploadPromise) {
    await uploadPromise;
  }

  project.creatives[index].users.push({
    workHours: req.body.workHours,
    user: new mongoose.Types.ObjectId(req.body.user),
    duration: Number(req.body.duration),
    startDate: new Date(req.body.startDate),
    hourPrice: req.body.hourPrice,
    totalAmount: req.body.workHours * req.body.hourPrice,
    details: req.body.details,
    deadLine: new Date(
      new Date(req.body.startDate).setDate(
        new Date(req.body.startDate).getDate() + Number(req.body.duration),
      ),
    ),
    status: UserStatus.pending,
    attachments: req.body.attachments || [],
    contract: new mongoose.Types.ObjectId(req.body.user),
  });

  await project.save();

  const userIndex = project.creatives[index].users.findIndex(
    (user) => user.user.toString() === req.body.user,
  );

  const user = project.creatives[index].users[userIndex];
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
    project: project._id,
    startDate: user.startDate,
    duration: user.duration,
    workHours: user.workHours,
    hourPrice: user.hourPrice,
    deadline: user.deadLine,
    details: user.details,
    totalPrice: user.totalAmount,
    cycle: CYCLES.teamProject,
    attachments: user.attachments,
    stageExpiration,
    category: project.creatives[index].category,
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
  
  // Send notifications in parallel
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
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'team project new contract',
      'your team project contract created successfully',
      Channels.new_contract,
    ),
  ]);

  user.contract = contract._id;
  await project.save();

  res.status(200).json({ message: 'success', data: project });
};
