import { BadRequestError, NotFound, Roles, Plans } from '@duvdu-v1/duvdu';

import {
  CreateRoleHandler,
  GetRoleHandler,
  GetRolesHandler,
  RemoveRoleHandler,
  UpdateRoleHandler,
} from '../../types/endpoints/plans.endpoints';

export const createRoleHandler: CreateRoleHandler = async (req, res) => {
  const role = await Roles.create(req.body);
  res.status(201).json({ message: 'success', id: role.id });
};

export const removeRoleHandler: RemoveRoleHandler = async (req, res, next) => {
  const role = await Roles.findOneAndDelete({ _id: req.params.roleId, key: { $ne: 'admin' } });
  if (!role) return next(new NotFound('role not found'));
  const plans = await Plans.countDocuments({ role: req.params.roleId });
  if (plans > 0) return next(new BadRequestError(`already ${plans} plans related to this role`));
  res.status(204).json();
};

export const getRolesHandler: GetRolesHandler = async (req, res) => {
  const roles = await Roles.find({ key: { $ne: 'admin' } }).select('key');
  res.status(200).json({ message: 'success', data: roles });
};

export const getRoleHandler: GetRoleHandler = async (req, res, next) => {
  const role = await Roles.findOne({ _id: req.params.roleId, key: { $ne: 'admin' } });
  if (!role) return next(new NotFound('role not found'));
  res.status(200).json({ message: 'success', data: role });
};

export const updateRoleHandler: UpdateRoleHandler = async (req, res, next) => {
  const role = await Roles.findOneAndUpdate(
    { _id: req.params.roleId, key: { $ne: 'admin' } },
    { features: req.body.features },
  );
  if (!role) return next(new NotFound('role not found'));
  res.status(200).json({ message: 'success' });
};
