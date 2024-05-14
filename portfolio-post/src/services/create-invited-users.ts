import { Users } from '@duvdu-v1/duvdu';

export const createInvitedUsers = async (
  users: { phoneNumber: { number: string }; fees: number }[],
): Promise<{ creative: string; fees: number }[]> => {
  const createdUsers: { creative: string; fees: number }[] = [];
  for (const user of users) {
    try {
      const newUser = await Users.create({ phoneNumber: { number: user.phoneNumber.number } });
      createdUsers.push({ creative: newUser.id, fees: user.fees });
      // eslint-disable-next-line no-empty
    } catch (error) {
      const oldUser = await Users.findOne({ 'phoneNumber.number': user.phoneNumber });
      createdUsers.push({ creative: oldUser?.id, fees: user.fees });
    }
  }

  return createdUsers;
};
