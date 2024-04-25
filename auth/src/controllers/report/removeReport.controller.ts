import 'express-async-errors';
import { Report } from '@duvdu-v1/duvdu';

import { RemoveReportHandler } from '../../types/endpoints/report.endpoints';



export const removeReportHandler:RemoveReportHandler = async (req,res)=>{
  await Report.findByIdAndDelete(req.params.reportId);
  res.status(204).json({message:'success'});
};