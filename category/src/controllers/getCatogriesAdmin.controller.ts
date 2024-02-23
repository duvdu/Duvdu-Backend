import { Category } from '../models/category.model';
import { GetCatogriesAdminHandler } from '../types/endpoints/endpoints';




export const getCatogriesAdminHandler:GetCatogriesAdminHandler = async (req,res)=>{
  const catogry = await Category.find();
  res.status(200).json({message:'success' , data:catogry});
};