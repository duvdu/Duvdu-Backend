import { BadRequestError, NotFound } from '@duvdu-v1/duvdu';

import { Plans } from '../../models/Plan.model';
import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import {
  CreatePlanHandler,
  GetPlanHandler,
  GetPlansHandler,
  RemovePlanHandler,
  UpdatePlanHandler,
} from '../../types/endpoints/plans.endpoints';

export const createPlanHandler: CreatePlanHandler = async (req, res, next) => {
  const role = await Roles.findById(req.body.role);
  if (!role) return next(new NotFound('role not found'));
  const plan = await Plans.create(req.body);
  res.status(201).json({ message: 'success', id: plan.id });
};

export const updatePlanHandler: UpdatePlanHandler = async (req, res, next) => {
  const plan = await Plans.findByIdAndUpdate(req.params.planId, req.body);
  if (!plan) return next(new NotFound('plan not found'));
  res.status(200).json({ message: 'success' });
};

export const removePlanHandler: RemovePlanHandler = async (req, res, next) => {
  const plan = await Plans.findByIdAndDelete(req.params.planId);
  if (!plan) return next(new NotFound('plan not found'));
  const users = await Users.countDocuments({ plan: req.params.planId });
  if (users > 0) return next(new BadRequestError(`already ${users} subscriped in this plan`));
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
  if (!plan) return next(new NotFound('plan not found'));
  res.status(200).json({ message: 'success', data: plan as any });
};
