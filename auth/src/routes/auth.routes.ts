import {
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  optionalAuthenticated,
  PERMISSIONS,
  uploadProjectMedia,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/auth';
import * as val from '../validators/auth';

const router = Router();

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
  );
router
  .route('/crm/:userId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateUser),
    uploadProjectMedia(FOLDERS.auth),
    val.updateUser,
    handlers.updateUserHandler,
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
  isauthorized(PERMISSIONS.changePassword),
  val.changePasswordVal,
  handlers.changePasswordHandler,
);
router
  .route('/update-phone')
  .all(isauthenticated, isauthorized(PERMISSIONS.updatePhoneNumber))
  .get(handlers.askUpdatePhoneNumberHandler)
  .patch(val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler);

router
  .route('/reset-password')
  .get(val.askResetPasswordVal, handlers.askForgetPasswordHandler)
  .post(val.resetPasswordVal, handlers.updateForgetenPasswordHandler);

router.post('/resend-code', val.resendCodeVal, handlers.resendVerificationCodeHandler);

router
  .route('/profile')
  .all(isauthenticated)
  .get(handlers.getLoggedUserProfileHandler)
  .patch(
    isauthorized(PERMISSIONS.updateProfile),
    uploadProjectMedia(FOLDERS.auth),
    val.updateProfileVal,
    handlers.updateProfileHandler,
  )
  // TODO: add authorization
  .put(
    globalUploadMiddleware('defaults' as any).fields([
      { name: 'profile', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
    handlers.updateDefaultImagesCrm,
  );

router.get('/profile/projects', isauthenticated, handlers.getLoggedUserProjects);
router.get('/profile/projects/:username', handlers.getUserProjectsByUsername);

router.route('/profile/:username').get(optionalAuthenticated, handlers.getUserProfileHandler);

router.route('/verify').post(val.verify, handlers.verifyHandler);

export const authRoutes = router;
