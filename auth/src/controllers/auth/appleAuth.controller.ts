import passport from 'passport';
import { Strategy as AppleStrategy } from 'passport-apple';

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
