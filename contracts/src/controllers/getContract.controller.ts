import { Contracts, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getContract: RequestHandler<
  {contractId:string},
  SuccessResponse<{ data: any }>,
  unknown,
    unknown
> = async (req, res , next) => {
  const contract = await Contracts.findOne({contract:req.params.contractId}).populate([
    {path:'sp' , select:'isOnline profileImage username name rank projectsView'} ,
    {path:'customer' , select:'isOnline profileImage username name rank projectsView'} ,
    {path:'contract'}
  ]).sort({createdAt: -1});

  if (!contract) 
    return next(new NotFound({en:'contract not found' , ar:'العقد غير موجود'} , req.lang));

  res.status(200).json({message:'success' , data:contract});
    
};