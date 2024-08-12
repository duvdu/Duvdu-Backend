/* eslint-disable @typescript-eslint/no-unused-vars */
import { SystemRoles, Roles, Users, VerificationReason } from '@duvdu-v1/duvdu';
import passport from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';

import { env } from '../../config/env';
// import { generateAccessToken } from '../../utils/generateToken';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: `${env.google.client_id}`,
      clientSecret: `${env.google.client_secret}`,
      callbackURL: 'http://localhost:3000/api/users/oauth/google/callback',
      scope: ['profile', 'email', 'phone'],
      passReqToCallback: true,
    },
    async (request: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
      const role = await Roles.findOne({ key: SystemRoles.unverified });
      if (!role) throw new Error('role not found');
      let user = await Users.findOne({ googleId: profile.id });
      if (!user) {
        user = new Users({
          googleId: profile.id,
          role: role.id,
          verificationCode: {
            reason: VerificationReason.completeSginUp,
          },
        });
        await user.save();
      }
      console.log(true);

      // const Token = generateAccessToken({
      //   id: user.id,
      //   isBlocked: { value: false },
      //   isVerified: false,
      //   role: { key: role.key, permissions: role.permissions },
      // });

      // user.token = Token;
      await user.save();
      return done(null, user);
    },
  ),
);

passport.use(
  new AppleStrategy(
    {
      clientID: 'YOUR_APPLE_CLIENT_ID',
      teamID: 'YOUR_APPLE_TEAM_ID',
      keyID: 'YOUR_APPLE_KEY_ID',
      privateKeyString: 'YOUR_APPLE_PRIVATE_KEY',
      callbackURL: 'http://localhost:3000/api/users/oauth/apple/callback',
    },
    (accessToken: any, refreshToken: any, decodedIdToken: any, profile: any, done: any) => {
      console.log(profile);

      // Handle the user authentication and profile creation here
      // Call the `done` callback with the user object
      // TODO: create default saved project list after user creation
    },
  ),
);

export { passport };
