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
  Producer,
  ProducerContract,
  Users,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/endpoints';

export const createContractHandler: CreateContractHandler = async (req, res, next) => {
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    
    // Run producer validation and file upload in parallel
    const [producer] = await Promise.all([
      Producer.findById(req.body.producer),
      new Bucket().saveBucketFiles(FOLDERS.producer, ...attachments)
    ]);

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
    req.body.attachments = attachments.map((el) => `${FOLDERS.producer}/${el.filename}`);
    Files.removeFiles(...req.body.attachments);

    // Create contract and fetch user in parallel
    const [contract, user] = await Promise.all([
      ProducerContract.create({
        ...req.body,
        user: req.loggedUser.id,
        sp: producer.user,
      }),
      Users.findById(req.loggedUser.id)
    ]);

    // Run notifications and contract creation in parallel
    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        producer.user.toString(),
        contract._id.toString(),
        'contract',
        'new producer contract',
        `new contract created by ${user?.name}`,
        Channels.new_contract,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'new producer contract',
        'contract created successfully',
        Channels.new_contract,
      ),
      Contracts.create({
        _id: contract._id,
        contract: contract._id,
        customer: contract.user,
        sp: producer.user,
        cycle: CYCLES.producer,
        ref: MODELS.producerContract,
      })
    ]);

    // Commented out queue logic as in original code
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

    res.status(201).json({ message: 'success', data: contract });
  } catch (error) {
    next(error);
  }
};
