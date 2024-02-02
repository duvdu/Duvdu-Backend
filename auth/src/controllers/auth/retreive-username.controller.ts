import 'express-async-errors';

import { Users } from '../../models/User.model';
import { RetreiveUsernameHandler } from '../../types/endpoints/user.endpoints';

export const retreiveUsernameHandler: RetreiveUsernameHandler = async (req, res) => {
  const user = await Users.findOne({ username: req.body.username });
  res.status(200).json({ message: 'success', isUsernameExists: !!user });
};
