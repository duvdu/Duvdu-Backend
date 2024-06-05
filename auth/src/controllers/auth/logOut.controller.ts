import 'express-async-errors';

import { userSession } from '@duvdu-v1/duvdu';

import { LogoutHandler } from '../../types/endpoints/user.endpoints';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';


export const logoutHandler:LogoutHandler = async (req,res)=>{
  const fingerprint = await generateBrowserFingerprint();
  const userAgent = req.headers['user-agent'];
  let clientType = 'web';
    
  if (userAgent && /mobile|android|touch|webos/i.test(userAgent)) {
    clientType = 'mobile';
  }
    
  await userSession.deleteOne({ user: req.loggedUser.id, fingerPrint: fingerprint, clientType });
    
  req.session.destroy((err) => {
    if (err) 
      throw new Error('Error destroying session');
  });
    
  res.status(200).json({ message: 'success' });
};