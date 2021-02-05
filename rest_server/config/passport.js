
require('dotenv').config;
const passport         = require('passport');
const GoogleStrategy   = require('passport-google-oauth2').Strategy;

const User = require('../models/userTb.model');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // deserialize user
// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => {
//     done(null, user);
//   });
// });


passport.use( new GoogleStrategy(
  {
    clientID      : process.env.GOOGLE_CLIENT_ID,
    clientSecret  : process.env.GOOGLE_SECRET,
    callbackURL   : '/auth/google/callback',
    //passReqToCallback   : true
  }, (accessToken, refreshToken, profile, done) => {
    const googleID = profile.id;
    
    // create user object 
    const newUser = {
      userId: profile.email,
      social: profile.provider,
      nickname: profile.displayName,
      photoUrl: profile.photos[0].value,
      memo: accessToken
    };

    console.log(newUser);

   // user가 db에 없다면 새로 저장하기
    User.findOne({memo : googleID}).then((user) => {
      if(!user){
        new User(newUser).save().then((createdUser) => {
          console.log('User: ', createdUser);
          done(null, createdUser);
        })
        .catch((err) => {
          console.log('Error', err);
          done(err, null);
        });
      }
      else {
        console.log('Already exists', user);        
        done(null, user);
      }
    })
    .catch((err) => {
      console.log('Error', err);      
      done(err, null);
    });
  }
));


module.exports = passport;