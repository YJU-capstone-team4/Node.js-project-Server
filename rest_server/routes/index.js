var express = require('express');
var router = express.Router();
const passport = require('')

// 로그인 확인
const authenticateUser = (req, res, next) => {
	if (req.isAuthenticated()) {
	  next();
	} else {
	  res.status(301).redirect('/login');
	}
  };

  module.exports = router;