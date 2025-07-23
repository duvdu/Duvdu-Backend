import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  optionalAuthenticated,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/auth';
import * as val from '../validators/auth';

const router = Router();

router.post(
  '/face-recognition',
  isauthenticated,
  globalUploadMiddleware(FOLDERS.auth).fields([{ name: 'faceRecognition', maxCount: 1 }]),
  checkRequiredFields({ fields: ['faceRecognition'] }),
  handlers.faceRecognitionController,
);

router.route('/provider').post(val.loginProvider, handlers.loginWithProviderHandler);
router
  .route('/provider/phone')
  .post(isauthenticated, val.updatePhoneNumberVal, handlers.updateProviderPhoneNumberHandler);

router
  .route('/crm')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createUser),
    val.createUser,
    handlers.createUserHandler,
  )
  .get(
    isauthenticated,
    val.findUsers,
    globalPaginationMiddleware,
    handlers.filterUsers,
    handlers.getCrmUsers,
  );

router
  .route('/crm/:userId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateUser),
    globalUploadMiddleware(FOLDERS.auth).fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    val.updateUser,
    handlers.updateUserHandler,
  )
  .get(
    // isauthenticated,
    val.getCrmUser,
    handlers.getCrmUser,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeUser),
    val.deleteUser,
    handlers.deleteUser,
  );
router
  .route('/crm/:userId/block')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.blockUser),
    val.blockUser,
    handlers.blockUserHandler,
  )
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.unBlockUser),
    val.unblockUser,
    handlers.unBlockUserHandler,
  );

router
  .route('/find')
  .get(
    val.findUsers,
    optionalAuthenticated,
    globalPaginationMiddleware,
    handlers.filterUsers,
    handlers.findUsers,
  );
router.post('/logout', isauthenticated, handlers.logoutHandler);
router.post('/signin', val.signinVal, handlers.signinHandler);
router.post('/signup', val.signupVal, handlers.signupHandler);

router.post(
  '/retreive-username',
  // rateLimit({
  //   windowMs: 10 * 60 * 1000,
  //   max: 20,
  // }),
  val.retreiveUsernameVal,
  handlers.retreiveUsernameHandler,
);
router.patch(
  '/change-password',
  isauthenticated,
  val.changePasswordVal,
  handlers.changePasswordHandler,
);
router
  .route('/update-phone')
  .get(handlers.askUpdatePhoneNumberHandler)
  .patch(val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler);

router
  .route('/reset-password')
  .patch(val.askResetPasswordVal, handlers.askForgetPasswordHandler)
  .post(val.resetPasswordVal, handlers.updateForgetenPasswordHandler);

router.post('/resend-code', val.resendCodeVal, handlers.resendVerificationCodeHandler);

router
  .route('/profile')
  .all(isauthenticated)
  .get(handlers.getLoggedUserProfileHandler)
  .patch(
    globalUploadMiddleware(FOLDERS.auth).fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    val.updateProfileVal,
    handlers.updateProfileHandler,
  );

router.get('/profile/projects', isauthenticated, handlers.getLoggedUserProjects);
router.get('/profile/projects/:username', handlers.getUserProjectsByUsername);

router.route('/profile/:username').get(optionalAuthenticated, handlers.getUserProfileHandler);

router.route('/verify').post(val.verify, handlers.verifyHandler);
router.route('/delete').delete(isauthenticated, handlers.deleteLoggedUser);
export const authRoutes = router;
