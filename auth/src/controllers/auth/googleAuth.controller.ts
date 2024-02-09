import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';

import { env } from '../../config/env';

passport.use(new GoogleStrategy({
  clientID: `${env.google.client_id}`,
  clientSecret: `${env.google.client_secret}`,
  callbackURL:'https://duvdu.dev/api/users/auth/google/callback',
  passReqToCallback:true
},
(request: any, accessToken: any, refreshToken: any, profile: any, done: any)=>{
  console.log(profile);
  return done(null , profile);
    
}));

passport.serializeUser((user , done)=>{
  done(null , user);
});

passport.deserializeUser((user:any,done)=>{
  done(null, user);
});

export default passport;