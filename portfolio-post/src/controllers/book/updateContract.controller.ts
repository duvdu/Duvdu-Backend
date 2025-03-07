import 'express-async-errors';

import {
  BadRequestError,
  Channels,
  IprojectContract,
  NotAllowedError,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';
import { calculateTotalPrice } from '../../services/checkToolsAndFunctions.service';

export const updateContractHandler: RequestHandler<
  { contractId: string },
  SuccessResponse<{ data: IprojectContract }>,
  Partial<
    Pick<IprojectContract, 'duration'> & {
      equipment: {
        tools: { id: string; unitPrice: number; units: number }[];
        functions: { id: string; unitPrice: number; units: number }[];
      };
      unitPrice: number;
      numberOfUnits: number;
    }
  >,
  unknown
> = async (req, res, next) => {
  const contract = await ProjectContract.findById(req.params.contractId);
  if (!contract)
    return next(new NotFound({ en: 'contract notfound', ar: 'العقد غير موجود' }, req.lang));

  if (contract.sp.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  if (contract.status != ProjectContractStatus.updateAfterFirstPayment)
    return next(
      new BadRequestError({ en: 'invalid contract status', ar: 'حالة العقد غير صالحة' }, req.lang),
    );

  // update equipment

  if (req.body.equipment) {
    const { functions, tools, totalPrice } = await calculateTotalPrice(
      contract.project.toString(),
      req.body.equipment,
      req.lang,
    );

    contract.tools = tools;
    contract.functions = functions;
    contract.equipmentPrice = totalPrice;
  }

  // update duration and deadline
  if (req.body.duration) {
    contract.duration = req.body.duration;
    contract.deadline = new Date(
      new Date(contract.startDate).setDate(
        new Date(contract.startDate).getDate() + req.body.duration,
      ),
    );
  }

  // update number of units
  if (req.body.numberOfUnits) contract.projectScale.numberOfUnits = req.body.numberOfUnits;

  // update unit price
  if (req.body.unitPrice) contract.projectScale.unitPrice = req.body.unitPrice;

  const unitPriceTotal = contract.projectScale.unitPrice * contract.projectScale.numberOfUnits;
  const allPrice = contract.equipmentPrice + unitPriceTotal;
  contract.totalPrice = allPrice;
  contract.secondPaymentAmount = contract.totalPrice - contract.firstPaymentAmount;

  await contract.save();

  const user = await Users.findOne({ _id: req.loggedUser.id });
  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} updated the contract`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} updated the contract`,
      Channels.notification,
    ),
  ]);

  res.status(200).json({ message: 'success', data: contract });
};
