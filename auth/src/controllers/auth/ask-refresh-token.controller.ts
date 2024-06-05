// import { NotFound, UnauthenticatedError, Users, Irole  } from '@duvdu-v1/duvdu';
// import { RequestHandler } from 'express';
// import { verify } from 'jsonwebtoken';

// import { env } from '../../config/env';
// import { generateAccessToken } from '../../utils/generateToken';

// export const askRefreshTokenHandler: RequestHandler = async (req, res, next) => {
//   if (!req.session.refresh) return next(new UnauthenticatedError({en:'refresh token not found' , ar: 'الرمز المميز لإعادة التحميل غير موجود'} , req.lang));
//   let payload: { id: string };
//   try {
//     payload = <{ id: string }>verify(req.session.refresh, env.jwt.secret);
//     const user = await Users.findById(payload.id).populate('role');
//     if (!user) return next(new NotFound({en:'user not found' , ar: 'المشروع غير موجود'} , req.lang));
//     const role = <Irole>user.role;
//     const token = generateAccessToken({
//       id: user.id,
//       isBlocked: user.isBlocked,
//       isVerified: user.isVerified,
//       role: { key: role.key, permissions: role.permissions },
//     });
//     req.session.access = token;
//     res.status(200).json({ message: 'success' });
//   } catch (error) {
//     console.error(error);
//     return res.status(423).json({ message: 'refresh token expired' });
//   }
// };

import { NotFound, UnauthenticatedError, Users, Irole, userSession  } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { env } from '../../config/env';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateAccessToken } from '../../utils/generateToken';

export const askRefreshTokenHandler: RequestHandler = async (req, res, next) => {
  if (!req.session.refresh) return next(new UnauthenticatedError({en:'refresh token not found' , ar: 'الرمز المميز لإعادة التحميل غير موجود'} , req.lang));
  let payload: { id: string };
  try {
    payload = <{ id: string }>verify(req.session.refresh, env.jwt.secret);
    const user = await Users.findById(payload.id).populate('role');
    if (!user) return next(new NotFound({en:'user not found' , ar: 'المشروع غير موجود'} , req.lang));
    const role = <Irole>user.role;
    const token = generateAccessToken({
      id: user.id,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      role: { key: role.key, permissions: role.permissions },
    });
    
    // Find user session based on platform fingerprint
    const userAgent = req.headers['user-agent'];
    let clientType = 'web';
    if (userAgent && /mobile|android|touch|webos/i.test(userAgent)) {
      clientType = 'mobile';
    }
    const fingerprint = await generateBrowserFingerprint(); 
    const userSessionDoc = await userSession.findOne({ user: user._id, fingerPrint: fingerprint, clientType }).exec();
    
    if (userSessionDoc) {
      await userSessionDoc.updateOne({ accessToken: token });
    }

    req.session.access = token;
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    return res.status(423).json({ message: 'refresh token expired' });
  }
};
