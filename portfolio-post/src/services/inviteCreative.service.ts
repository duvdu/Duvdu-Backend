import { InviteStatus, Users } from '@duvdu-v1/duvdu';



export const inviteCreatives = async (users:{number:string}[])=>{
    
  const createdUsers = await Users.create(
    users.map((user) => ({ phoneNumber: { number: user.number }  , haveInvitation:true })),
  );
  return createdUsers.map((el) => ({ creative: el._id , inviteStatus:InviteStatus.pending}));
};