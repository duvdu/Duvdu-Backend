import {
  checkRequiredFields,
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
router
  .route('/find')
  .get(
    val.findUsers,
    optionalAuthenticated,
    globalPaginationMiddleware,
    handlers.filterUsers,
    handlers.findUsers,
  );

router.post('/signin', val.signinVal, handlers.signinHandler);
router.post('/signup', val.signupVal, handlers.signupHandler);
router.post(
  '/complete-sginup',
  isauthenticated,
  val.completeSginUpVal,
  handlers.completeSginupHandler,
);
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
  .route('/reset-password/:username')
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
    globalUploadMiddleware('defaults' as any).single('file'),
    checkRequiredFields({ single: 'file' }),
    handlers.updateDefaultProfileCrm,
  );

router.get('/profile/projects', isauthenticated, handlers.getLoggedUserProjects);

router.get(
  '/profile/favourites',
  isauthenticated,
  val.getFavourites,
  globalPaginationMiddleware,
  handlers.getFavouriteProjects,
);
router.patch(
  '/profile/favourites/:projectId',
  isauthenticated,
  val.favouritesAction,
  handlers.updateFavouriteList,
);

router.route('/profile/:username').get(optionalAuthenticated, handlers.getUserProfileHandler);

router.route('/verify').post(val.verify, handlers.verifyHandler);

router.route('/refresh').post(handlers.askRefreshTokenHandler);

export const authRoutes = router;
