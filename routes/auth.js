const express  = require('express');
const { IdTokenClient } = require('google-auth-library');
const router   = express.Router();
const passport = require('../config/passport.js');

const UserTb = require('../models/userTb.model');

router.get('/login', function(req,res){
  res.render('auth/login');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json("success");
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google'), authSuccess
);

router.get("/current_user", (req, res) => { 
  res.send(req.user); 
});


function authSuccess(req, res) {
  res.status(200).json("success")
}

module.exports = router;