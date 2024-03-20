import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { Irole } from '../types/Role';

export const Roles = model<Irole>(
  MODELS.role,
  new Schema<Irole>(
    {
      key: { type: String, unique: true },
<<<<<<< HEAD
      permissions: [String],
=======
      features: [String],
      system:{
        type:Boolean,
        default:false
      }
>>>>>>> main
    },
    { collection: MODELS.role },
  ),
);
