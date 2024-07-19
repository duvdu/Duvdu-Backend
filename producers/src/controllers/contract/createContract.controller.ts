import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Channels,
  Contracts,
  CYCLES,
  Files,
  FOLDERS,
  MODELS,
  NotAllowedError,
  NotFound,
  NotificationDetails,
  NotificationType,
  Producer,
  ProducerContract,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/endpoints';

export const createContractHandler: CreateContractHandler = async (req, res, next) => {
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const producer = await Producer.findById(req.body.producer);
    if (!producer)
      return next(
        new NotFound({ en: 'producer not found', ar: 'لم يتم العثور على المنتج' }, req.lang),
      );

    if (req.loggedUser.id === producer.user.toString())
      return next(new NotAllowedError(undefined, req.lang));

    if (req.body.expectedBudget < producer.minBudget)
      return next(
        new BadRequestError(
          {
            en: 'project budget must me greater than producer minimum budget',
            ar: 'يجب أن يكون ميزانية المشروع أكبر من الحد الأدنى لميزانية المنتج',
          },
          req.lang,
        ),
      );

    if (req.body.expectedBudget > producer.maxBudget)
      return next(
        new BadRequestError(
          {
            en: 'project budget must me less than producer max budget',
            ar: 'يجب أن تكون ميزانية المشروع أقل من الحد الأقصى لميزانية المنتج',
          },
          req.lang,
        ),
      );

    req.body.stageExpiration = await getBestExpirationTime(req.body.appointmentDate.toString());

    await new Bucket().saveBucketFiles(FOLDERS.producer, ...attachments);
    req.body.attachments = attachments.map((el) => `${FOLDERS.producer}/${el.filename}`);
    Files.removeFiles(...req.body.attachments);

    const contract = await ProducerContract.create({
      ...req.body,
      user: req.loggedUser.id,
      sp:producer.user
    });

    await sendNotification(
      req.loggedUser.id,
      producer.user.toString(),
      contract._id.toString(),
      NotificationType.new_producer_contract,
      NotificationDetails.newProducerContract.title,
      NotificationDetails.newProducerContract.message,
      Channels.new_contract,
    );

    // const delay = contract.stageExpiration * 3600 * 1000;
    // // const delay = 1*60 * 1000;
    // await createContractQueue.add(
    //   {
    //     contractId: contract._id.toString(),
    //   },
    //   {
    //     delay,
    //   },
    // );

    await Contracts.create({
      contract: contract._id,
      customer: contract.user,
      sp: producer.user,
      cycle: CYCLES.producer,
      ref: MODELS.producerContract,
    });

    res.status(201).json({ message: 'success', data: contract });
  } catch (error) {
    next(error);
  }
};
