import { Users } from '@duvdu-v1/duvdu';

import { RetreiveUsernameHandler } from '../../types/endpoints/user.endpoints';

export const retreiveUsernameHandler: RetreiveUsernameHandler = async (req, res) => {
  const { username, email, phoneNumber } = req.body;

  const user = await Users.findOne({
    $or: [{ username }, { email }, { phoneNumber: { key: 'phoneNumber.key', number: phoneNumber } }],
  });
  res.status(200).json({ message: 'success', isExists: !!user });
};
