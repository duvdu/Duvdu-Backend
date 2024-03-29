import { Iuser } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import passport from 'passport';

import { generateRefreshToken } from '../utils/generateToken';

const router = Router();

// router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google', passport.authenticate('google', { scope: ['email', 'profile', 'phone'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/api/users/oauth/google/success',
    failureRedirect: '/api/users/oauth/google/failure',
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get('/google/success', (req, res) => {
  console.log('hello here');
  req.session.access = (req.user as Iuser).token;
  req.session.refresh = generateRefreshToken({id:(req.user as Iuser).id});
  res.redirect('/profile');
});
router.get('/google/failure', (req, res) => {
  console.log('fail');
  res.send('helllo metoo');
});

router.get('/apple', passport.authenticate('apple'));

router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to the desired page
    res.redirect('/profile');
  },
);

export const oauthRoutes = router;
