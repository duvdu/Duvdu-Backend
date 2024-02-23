import { Category } from '../models/category.model';
import { GetCategoriesHandler } from '../types/endpoints/endpoints';

export const getCategoriesHandler:GetCategoriesHandler = async (req,res)=>{
  const categories = await Category.find({status:1});
  res.status(200).json({message:'success' , data:categories});
};