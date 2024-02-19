import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';

import { env } from '../../config/env';
import { Plans } from '../../models/Plan.model';
import { Users } from '../../models/User.model';
import { generateToken } from '../../utils/generateToken';

passport.use(new GoogleStrategy({
  clientID: `${env.google.client_id}`,
  clientSecret: `${env.google.client_secret}`,
  callbackURL:'http://localhost:3000/api/users/auth/google/callback',
  scope:['profile', 'email', 'phone'],
  passReqToCallback:true,
},
async (request: any, accessToken: any, refreshToken: any, profile: any, done: any)=>{
  const plans = await Plans.find().sort('-createdAt').limit(1);
  
  let user  = await Users.findOne({googleId:profile.id});
  if (!user) {
    user = new Users({
      googleId:profile.id,
      username: profile.email.substring(0, profile.email.indexOf('@')),
      plan: plans[0].id,
      name:profile.displayName,
      isBlocked:true
    });
    await user.save();
  }
  const token = generateToken({ id: user.id , planId:user.plan.toString() });
  user.token = token;
  await user.save();

  return done(null , user);
}));

passport.serializeUser((user , done)=>{
  done(null , user);
});

passport.deserializeUser(async (id,done)=>{
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;