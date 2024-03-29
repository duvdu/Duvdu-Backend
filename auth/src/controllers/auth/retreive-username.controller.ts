import { Users } from '@duvdu-v1/duvdu';

import { RetreiveUsernameHandler } from '../../types/endpoints/user.endpoints';

export const retreiveUsernameHandler: RetreiveUsernameHandler = async (req, res) => {
  const user = await Users.findOne({ username: req.body.username });
  res.status(200).json({ message: 'success', isUsernameExists: !!user });
};
