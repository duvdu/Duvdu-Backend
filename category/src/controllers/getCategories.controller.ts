import { Category } from '../models/category.model';
import { GetCategoriesHandler } from '../types/endpoints';

export const getCategoriesHandler:GetCategoriesHandler = async (req,res)=>{
  const categories = await Category.find();
  res.status(200).json({message:'success' , data:categories});
};