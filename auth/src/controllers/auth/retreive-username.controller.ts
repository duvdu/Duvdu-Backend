import { Users } from '@duvdu-v1/duvdu';

import { RetreiveUsernameHandler } from '../../types/endpoints/user.endpoints';

export const retreiveUsernameHandler: RetreiveUsernameHandler = async (req, res) => {
  const { username, email, phoneNumber } = req.body;

  if (!username && !email && !phoneNumber) {
    return res.status(400).json(<any>{ message: 'at Least One Required' });
  }

  const conditions = [];
  
  if (username) {
    conditions.push({ username });
  }
  
  if (email) {
    conditions.push({ email });
  }
  
  if (phoneNumber) {
    conditions.push({ 
      phoneNumber: {
        key: 'phoneNumber.key',
        number: phoneNumber.number,
      },
    });
  }

  const user = await Users.findOne({
    $or: conditions
  });
  res.status(200).json({ message: 'success', isExists: !!user });
};
