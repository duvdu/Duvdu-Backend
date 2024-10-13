import { Users } from '@duvdu-v1/duvdu';

export const createInvitedUsers = async (
  users: { phoneNumber: { number: string }; fees: number }[],
): Promise<{ creative: string; fees: number }[]> => {
  
  const createdUsers = await Users.create(
    users.map((user) => ({ phoneNumber: { number: user.phoneNumber.number } })),
  );

  return createdUsers.map((el, i) => ({ creative: el.id as string, fees: users[i].fees }));
};
