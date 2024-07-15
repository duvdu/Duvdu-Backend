import { NotFound } from '@duvdu-v1/duvdu';

import { TeamProject, UserStatus } from '../../models/teamProject.model';




export const updateUserStatus = async (project:string , category:string , sp:string , status:UserStatus , lang:string )=>{
  const team = await TeamProject.findById(project);
  if (!team)
    throw new NotFound({en:'team not found' , ar:'التيم غير موجود'} , lang);

  const index = team.creatives.findIndex((el : any )=> el.category.toString() === category);
  if (index == -1) 
    throw new NotFound({en:'category not found in team' , ar:'الفئة غير موجودة في الفريق'} , lang);

  const userIndex = team.creatives[index].users.findIndex((el:any) => el.user.toString() === sp);
  if (userIndex === -1) 
    throw new NotFound({en:'creative not found in this team' , ar:'المبدع غير موجود في هذا الفريق'} , lang);

  team.creatives[index].users[userIndex].status = status;
  await team.save();
};