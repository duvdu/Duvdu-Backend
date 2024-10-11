import { Contracts, Iuser, SuccessResponse, TeamProject, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getAvaliableUserICanChatHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: Iuser[] }>,
  unknown,
  unknown
> = async (req, res) => {
  const loggedUserId = req.loggedUser.id;
    
  const contracts = await Contracts.find({
    $or: [
      { sp: loggedUserId },
      { customer: loggedUserId }
    ]
  });
    
  const contractUserIds = contracts
    .map(contract => contract.sp.toString() === loggedUserId ? contract.customer : contract.sp)
    .filter(id => id.toString() !== loggedUserId.toString());
    
  const projects = await TeamProject.find({
    isDeleted: false,
    'creatives.users.user': { $all: [loggedUserId] }
  });
    
  const creativeUserIds = projects.flatMap(project => 
    project.creatives.flatMap(creative => 
      creative.users
        .filter(user => user.user.toString() !== loggedUserId)
        .map(user => user.user.toString())
    )
  );
    
  const potentialChatUserIds = [...new Set([...contractUserIds, ...creativeUserIds])];
    
  const potentialChatUsers = await Users.find({
    _id: { $in: potentialChatUserIds }
  }, 'name email username isOnline profileImage'); 
    
  res.json({ message:'success' , data: potentialChatUsers });
};
