import { Categories } from '@duvdu-v1/duvdu';

import { GetCategoriesHandler } from '../types/endpoints/endpoints';

export const getCategoriesHandler: GetCategoriesHandler = async (req, res) => {
  const categories = await Categories.find({ status: 1 });
  res.status(200).json({ message: 'success', data: categories });
};
