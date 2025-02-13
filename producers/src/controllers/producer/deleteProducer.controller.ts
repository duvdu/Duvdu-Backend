import 'express-async-errors';

import { BadRequestError, ContractStatus, Producer, ProducerContract } from '@duvdu-v1/duvdu';

import { DeleteProducerHandler } from '../../types/endpoints';

export const deleteProducerHandler: DeleteProducerHandler = async (req, res, next) => {
  const contract = await ProducerContract.findOne({
    producer: req.params.producerId,
    status: { $nin: [ContractStatus.rejected, ContractStatus.accepted, ContractStatus.canceled] },
  });
  if (contract)
    return next(
      new BadRequestError({ en: 'producer have a contract', ar: 'المنتج لديه عقود' }, req.lang),
    );
  await Producer.findByIdAndDelete(req.params.producerId);

  res.status(204).json({ message: 'success' });
};
