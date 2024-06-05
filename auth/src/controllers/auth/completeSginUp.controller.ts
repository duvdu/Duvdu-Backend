// import { NotFound, UnauthorizedError , SystemRoles , Roles , Users , VerificationReason } from '@duvdu-v1/duvdu';

// import { CompleteSginUpHandler } from '../../types/endpoints/user.endpoints';
// import { hashVerificationCode } from '../../utils/crypto';
// import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
// import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';




// export const completeSginupHandler:CompleteSginUpHandler = async (req,res,next)=>{
//   const role = await Roles.findOne({key:SystemRoles.unverified});
//   if (!role)return next(new NotFound({en:'role not found' , ar: 'الدور غير موجود'} , req.lang));

//   const user = await Users.findById(req.loggedUser.id);
//   if (!user) return next(new NotFound({en:'user not found' ,ar: 'المستخدم غير موجود' } , req.lang));
//   if (user.verificationCode?.reason != VerificationReason.completeSginUp) return next(new UnauthorizedError({en:'user not in this cycle' , ar: 'المستخدم ليس في هذه الدورة'} , req.lang));
//   const verificationCode = generateRandom6Digit();
//   user.name=req.body.name;
//   user.username=req.body.username;
//   user.phoneNumber=req.body.phoneNumber;
//   user.isVerified= false;
//   user.verificationCode= {
//     code: hashVerificationCode(verificationCode),
//     expireAt: new Date(Date.now() + 60 * 1000).toISOString(),
//     reason: VerificationReason.completeSginUp,
//   };

//   const accessToken = generateAccessToken({
//     id: user.id,
//     isBlocked: { value: false },
//     isVerified: false,
//     role: { key: role.key, permissions: role.permissions },
//   });
//   const refreshToken = generateRefreshToken({ id: user.id });
//   user.token = accessToken;
//   await user.save();
//   req.session.access = accessToken;
//   req.session.refresh = refreshToken;
//   //TODO: send OTP
//   res.status(200).json({message:'success'});
// };

import { NotFound, UnauthorizedError , SystemRoles , Roles , Users , VerificationReason, userSession } from '@duvdu-v1/duvdu';

import { CompleteSginUpHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const completeSginupHandler: CompleteSginUpHandler = async (req,res,next) => {
  const role = await Roles.findOne({ key: SystemRoles.unverified });
  if (!role) return next(new NotFound({en:'role not found' , ar: 'الدور غير موجود'} , req.lang));

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound({en:'user not found' ,ar: 'المستخدم غير موجود' } , req.lang));
  if (user.verificationCode?.reason != VerificationReason.completeSginUp) return next(new UnauthorizedError({en:'user not in this cycle' , ar: 'المستخدم ليس في هذه الدورة'} , req.lang));

  const verificationCode = generateRandom6Digit();
  user.name=req.body.name;
  user.username=req.body.username;
  user.phoneNumber=req.body.phoneNumber;
  user.isVerified= false;
  user.verificationCode= {
    code: hashVerificationCode(verificationCode),
    expireAt: new Date(Date.now() + 60 * 1000).toISOString(),
    reason: VerificationReason.completeSginUp,
  };


  const fingerprint = await generateBrowserFingerprint(); 

  const accessToken = generateAccessToken({
    id: user.id,
    isBlocked: { value: false },
    isVerified: false,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  let userSessionDoc = await userSession.findOne({ user: user._id, fingerPrint: fingerprint }).exec();
  const userAgent = req.headers['user-agent'];
  let clientType = 'web';

  if (userAgent && /mobile|android|touch|webos/i.test(userAgent))
    clientType = 'mobile';
  if (userSessionDoc) {
    await userSessionDoc.updateOne({ accessToken, refreshToken });
  } else {
    userSessionDoc = await userSession.create({
      user: user._id,
      fingerPrint: fingerprint,
      accessToken,
      refreshToken,
      clientType,
      userAgent
    });
  }


  user.token = accessToken;
  await user.save();

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  // TODO: send OTP

  res.status(200).json({ message: 'success' });
};
