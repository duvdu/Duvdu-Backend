import 'express-async-errors';

import { Bucket, Channels, Contracts, CYCLES, Files, FOLDERS, NotAllowedError, NotFound, NotificationDetails, NotificationType, Users } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { sendNotification } from './sendNotification';
import { TeamContract, TeamProject, UserStatus } from '../../models/teamProject.model';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { AddCreativeHandler } from '../../types/project.endpoints';
// import { pendingQueue } from '../../utils/expirationQueue';


export const addCreativeHandler:AddCreativeHandler = async (req,res,next)=>{

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  console.log(attachments);
  
  const project = await TeamProject.findOne({_id:req.params.teamId , isDeleted:{$ne:true}});

  if (!project) 
    return next(new NotFound({en:'team not found' , ar:'التيم غير موجود'}));

  if (project.user.toString() != req.loggedUser.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const creative = await Users.findById(req.body.user);
  if (!creative) 
    return next(new NotFound({en:'user not found' , ar:'المستخدم غير موجود'} , req.lang));
    
  const index = project.creatives.findIndex(creative => creative.category.toString() === req.body.category);

  if (index === -1) 
    return next(new NotFound({en:'category not found in team' , ar:'الفئة غير موجودة في الفريق'} , req.lang));

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.team_project, ...attachments);
    req.body.attachments = attachments.map((el) => `${FOLDERS.team_project}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }

  project.creatives[index].users.push(
    {
      workHours:req.body.workHours,
      user: new mongoose.Types.ObjectId(req.body.user),
      duration:Number(req.body.duration),
      startDate:new Date(req.body.startDate),
      hourPrice:req.body.hourPrice,
      totalAmount: req.body.workHours * req.body.hourPrice,
      details:req.body.details,
      deadLine:new Date(
        new Date(req.body.startDate).setDate(
          new Date(req.body.startDate).getDate() + Number(req.body.duration),
        ),
      ),
      status: UserStatus.pending,
      attachments:req.body.attachments
    }
  );

  await project.save();

  const userIndex = project.creatives[index].users.findIndex(user => user.user.toString() === req.body.user);

  const user = project.creatives[index].users[userIndex];
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
    project: project._id,
    startDate: user.startDate,
    duration: user.duration,
    workHours: user.workHours,
    hourPrice: user.hourPrice,
    deadLine: user.deadLine,
    details: user.details,
    totalAmount: user.totalAmount,
    cycle: CYCLES.teamProject,
    attachments:user.attachments,
    stageExpiration,
    category: project.creatives[index].category
  });

  // create contract an all contracts 
  await Contracts.create({
    contract: contract._id,
    customer: contract.customer,
    sp: contract.sp,
    cycle: CYCLES.teamProject,
    ref: 'team_contracts',
  });

  // send notification to user
  await sendNotification(
    contract.customer.toString(),
    contract.sp.toString(),
    contract._id.toString(),
    NotificationType.new_team_contract,
    NotificationDetails.newTeamContract.title,
    NotificationDetails.newTeamContract.message,
    Channels.new_contract,
  );

  // use pending expiration
  // TODO:
  // const delay = contract.stageExpiration * 3600 * 1000;
  // pendingQueue.add({contractId:contract._id.toString() , lang:req.lang} , {delay});

  res.status(200).json({message:'success' , data:project});
};