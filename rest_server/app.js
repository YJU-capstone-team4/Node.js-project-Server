require('dotenv').config();
const express   = require('express');
const app       = express();
const passport  = require('passport');
const session   = require('express-session');
const mongoose = require('mongoose');

const PORT = 3000;

// DB 연결
mongoose.connect(process.env.ATLAS_URI, 
{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

// 로그인 확인용
app.set('view engine', 'ejs');
app.use(session({secret:'MySecret', resave: false, saveUninitialized:true}));

// passport 세팅
app.use(passport.initialize());
app.use(passport.session());

// 로그인 라우트
app.use('/', require('./routes/main'));
app.use('/auth', require('./routes/auth'));

// 포트 연결
app.listen(PORT, function(){
  console.log('server on! http://localhost:'+PORT);
});