import { BadRequestError, NotFound, Roles, Plans, SuccessResponse, permissions } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

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
  if (!role) return next(new NotFound({ en: 'role not found', ar: 'الدور غير موجود' }, req.lang));
  const plans = await Plans.countDocuments({ role: req.params.roleId });
  if (plans > 0)
    return next(
      new BadRequestError(
        {
          en: `already ${plans} plans related to this role`,
          ar: 'بالفعل ${users} مشتركين في هذه الخطة',
        },
        req.lang,
      ),
    );
  res.status(204).json();
};

export const getRolesHandler: GetRolesHandler = async (req, res) => {
  const roles = await Roles.find({ key: { $ne: 'admin' } }).select('key permissions');
  res.status(200).json({ message: 'success', data: roles });
};

export const getRoleHandler: GetRoleHandler = async (req, res, next) => {
  const role = await Roles.findOne({ _id: req.params.roleId, key: { $ne: 'admin' } });
  if (!role) return next(new NotFound({ en: 'role not found', ar: 'الدور غير موجود' }, req.lang));
  res.status(200).json({ message: 'success', data: role });
};

export const updateRoleHandler: UpdateRoleHandler = async (req, res, next) => {
  const role = await Roles.findOneAndUpdate(
    { _id: req.params.roleId, key: { $ne: 'admin' } },
    req.body,
  );
  if (!role) return next(new NotFound({ en: 'role not found', ar: 'الدور غير موجود' }, req.lang));
  res.status(200).json({ message: 'success' });
};

export const getAllPermissions: RequestHandler<unknown, SuccessResponse, unknown, unknown> = async (
  req,
  res,
) => {
  res.status(200).json(<any>{ data: permissions });
};
