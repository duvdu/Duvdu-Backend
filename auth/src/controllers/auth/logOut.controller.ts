import 'express-async-errors';

import { Users, userSession } from '@duvdu-v1/duvdu';

import { LogoutHandler } from '../../types/endpoints/user.endpoints';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';


export const logoutHandler:LogoutHandler = async (req,res)=>{

  const fingerprint = await generateBrowserFingerprint();
  const userAgent = req.headers['user-agent'];
  const clientType = userAgent && /mobile|android|touch|webos/i.test(userAgent) ? 'mobile' : 'web';   
    
  await userSession.deleteOne({ user: req.loggedUser.id, fingerPrint: fingerprint, clientType , refreshToken:req.session.refresh });
  
  await Users.updateOne(
    { _id: req.loggedUser.id },
    { $pull: { refreshTokens: { token: req.session.refresh } } }
  );
  req.session.destroy((err) => {
    if (err) 
      throw new Error('Error destroying session');
  });
    
  res.status(200).json({ message: 'success' });
};