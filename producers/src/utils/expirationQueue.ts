import { ContractStatus, ProducerContract } from '@duvdu-v1/duvdu';
import Queue from 'bull';

import { env } from '../config/env';


interface IcontarctQueue {
    contractId: string;
}


export const contractQueue = new Queue<IcontarctQueue>(
  'contractProducer',
  env.redis.queue
);


contractQueue.process(async (job) => {
  try {
    
    const contract = await ProducerContract.findById(job.data.contractId);
        
    if (contract?.status == ContractStatus.pending || contract?.status == ContractStatus.acceptedWithUpdate ) {
      await ProducerContract.findByIdAndUpdate(
        job.data.contractId , 
        {
          status:ContractStatus.canceled,
          rejectedBy : 'system',
          actionAt: new Date()
        },
        {new:true}
      );
    }
  } catch (error) {
    return new Error('Failed to cancelled producer contract');
  }
});