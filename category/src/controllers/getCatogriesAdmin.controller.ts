import { Categories } from '@duvdu-v1/duvdu';

import { GetCatogriesAdminHandler } from '../types/endpoints/endpoints';

export const getCatogriesAdminHandler: GetCatogriesAdminHandler = async (req, res) => {
  const catogry = await Categories.find();
  res.status(200).json({ message: 'success', data: catogry });
};
