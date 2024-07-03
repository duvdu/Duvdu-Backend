import 'express-async-errors';

import { BadRequestError, ContractStatus, NotFound, Producer, ProducerContract } from '@duvdu-v1/duvdu';

import { DeleteLoggedProducerHandler } from '../../types/endpoints';

export const deleteLoggedProducerHandler: DeleteLoggedProducerHandler = async (req, res, next) => {

  const producer = await Producer.findOne({ user: req.loggedUser.id });
  if (!producer)
    return next(
      new NotFound({ en: 'producer not found', ar: 'لم يتم العثور على المنتج' }, req.lang),
    );

  const contract = await ProducerContract.findOne({producer:producer._id, status:{$ne:ContractStatus.canceled}});
  if (contract) 
    return next(new BadRequestError({en:'producer have a contract' , ar:'المنتج لديه عقود'} , req.lang));
  
  await Producer.findOneAndDelete({user:req.loggedUser.id});

  res.status(204).json({ message: 'success' });
};
