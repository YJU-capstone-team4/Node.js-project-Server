const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const AdminTb = require('../../models/adminTb.model');

router.post('/', passport.authenticate('local', {
  failureRedirect: '/', failureFlash: true
  }), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
  function (req, res) {
    res.redirect('/ytbReq');
});

module.exports = () => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    done(null, user); // 여기의 user가 req.user가 됨
  });

  passport.use(new LocalStrategy({
    usernameField: 'adminId',
    passwordField: 'adminPw',
    passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
  }, async (req, adminId, adminPw, done) => {
    const admin = await AdminTb.findOne({ 'userId' : adminId });
    console.log(adminId)
  
    if(adminId === admin.userId && adminPw === admin.password){
      return done(null, {
        'adminId': adminId,
      });
    } else {
      return done(false, null, { message: '아이디 또는 비밀번호가 틀렸습니다' })
    }
  }));

  // passport.use(new LocalStrategy({ // local 전략을 세움
  //   usernameField: 'adminId',
  //   passwordField: 'adminPw',
  //   session: true, // 세션에 저장 여부
  //   passReqToCallback: false,
  // }, (id, password, done) => {
  //   AdminTb.findOne({ userId: id }, (findError, user) => {
  //     if (findError) return done(findError); // 서버 에러 처리
  //     if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
  //     return user.comparePassword(password, (passError, isMatch) => {
  //       if (isMatch) {
  //         return done(null, user); // 검증 성공
  //       }
  //       return done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
  //     });
  //   });
  // }));
};