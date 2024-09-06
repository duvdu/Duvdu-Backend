import {  NotFound, Roles, Plans } from '@duvdu-v1/duvdu';

import {
  CreatePlanHandler,
  GetPlanHandler,
  GetPlansHandler,
  RemovePlanHandler,
  UpdatePlanHandler,
} from '../../types/endpoints/plans.endpoints';

export const createPlanHandler: CreatePlanHandler = async (req, res, next) => {
  const role = await Roles.findById(req.body.role);
  if (!role) return next(new NotFound({ en: 'role not found', ar: 'الدور غير موجود' }, req.lang));
  const plan = await Plans.create(req.body);
  res.status(201).json({ message: 'success', data: plan });
};

export const updatePlanHandler: UpdatePlanHandler = async (req, res, next) => {
  const plan = await Plans.findByIdAndUpdate(req.params.planId, req.body);
  if (!plan) return next(new NotFound({ en: 'plan not found', ar: 'الخطة غير موجودة' }, req.lang));
  res.status(200).json({ message: 'success', data: plan });
};

export const removePlanHandler: RemovePlanHandler = async (req, res, next) => {
  const plan = await Plans.findByIdAndDelete(req.params.planId);
  if (!plan) return next(new NotFound({ en: 'plan not found', ar: 'الخطة غير موجودة' }, req.lang));
  // const users = await Users.countDocuments({ plan: req.params.planId });
  // if (users > 0)
  //   return next(
  //     new BadRequestError(
  //       {
  //         en: `already ${users} subscriped in this plan`,
  //         ar: 'بالفعل ${users} مشتركين في هذه الخطة',
  //       },
  //       req.lang,
  //     ),
  //   );
  res.status(204).json();
};

export const getPlansHandler: GetPlansHandler = async (req, res) => {
  const plans = await Plans.find({ status: true });
  res.status(200).json({ message: 'success', data: plans });
};

export const getAllPlansHandler: GetPlansHandler = async (req, res) => {
  const plans = await Plans.find();
  res.status(200).json({ message: 'success', data: plans });
};

export const getPlanHandler: GetPlanHandler = async (req, res, next) => {
  const plan = await Plans.findById(req.params.planId).populate('role');
  if (!plan) return next(new NotFound({ en: 'plan not found', ar: 'الخطة غير موجودة' }, req.lang));
  res.status(200).json({ message: 'success', data: plan as any });
};
