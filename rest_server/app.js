require('dotenv').config();
const express       = require('express');
const app           = express();
const passport      = require('passport');
const session       = require('express-session');
const mongoose      = require('mongoose');
const cors          = require('cors');

const PORT = 3000;

// 관리자용 로그인
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))

// DB 연결
mongoose.connect(process.env.ATLAS_URI, 
{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// 로그인 확인용
app.set('view engine', 'ejs');
app.use(session({secret:'MySecret', resave: false, saveUninitialized:true}));

// passport 세팅
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.json({
        success: true,
    });
});

const AdminTb = require('./models/adminTb.model');

passport.use(new LocalStrategy({ // local 전략을 세움
  usernameField: 'adminId',
  passwordField: 'adminPw',
  session: true, // 세션에 저장 여부
  passReqToCallback: false,
}, (adminId, adminPw, done) => {
AdminTb.findOne({ userId: adminId }, async (findError, user) => {
  const pw = await AdminTb.findOne({userId: adminId});
  if (adminId == pw.userId && adminPw == pw.password)
      return done(null, user); // 검증 성공
})
}))

passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
  done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
});

passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
  done(null, user); // 여기의 user가 req.user가 됨
});

app.post('/admin/login', passport.authenticate('local', {
  failureRedirect: '/login', failureFlash: true
}), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
  function (req, res) {
    // res.redirect('/home');
    res.json({
      success: true,
    });
});

// // 로그인 라우트
// app.use('/', require('./routes/main'));
// app.use('/auth', require('./routes/auth'));

app.use(cors());
app.use(express.json());

const loginRouter = require('./routes/db/passport');
const userTbRouter = require('./routes/db/userTb');
const adminTbRouter = require('./routes/db/adminTb');
const adminTagTbRouter = require('./routes/db/adminTagTb');
const userTagTbRouter = require('./routes/db/userTagTb');
const ytbReqTbRouter = require('./routes/db/ytbReqTb');
const ytbCrawlingTbRouter = require('./routes/db/ytbCrawlingTb');
const ytbStoreTbRouter = require('./routes/db/ytbStoreTb');
const ytbChannelTbRouter = require('./routes/db/ytbChannelTb');
const attractionCrawlingTbRouter = require('./routes/db/attractionCrawlingTb');
const attractionTbRouter = require('./routes/db/attractionTb');
const shareFlowTbRouter = require('./routes/db/shareFlowTb');
const searchTbRouter = require('./routes/db/searchTb');

app.use('/login', loginRouter);
app.use('/userTb', userTbRouter);
app.use('/adminTb', adminTbRouter);
app.use('/adminTagTb', adminTagTbRouter);
app.use('/userTagTb', userTagTbRouter);
app.use('/ytbReqTb', ytbReqTbRouter);
app.use('/ytbCrawlingTb', ytbCrawlingTbRouter);
app.use('/ytbStoreTb', ytbStoreTbRouter);
app.use('/ytbChannelTb', ytbChannelTbRouter);
app.use('/attractionCrawlingTb', attractionCrawlingTbRouter);
app.use('/attractionTb', attractionTbRouter);
app.use('/shareFlowTb', shareFlowTbRouter);
app.use('/searchTb', searchTbRouter);

// 메인 api
const region = require('./routes/main/region');
const regionYtb = require('./routes/main/regionYtb');
const regionFlow = require('./routes/main/regionFlow');

app.use(region);
app.use(regionYtb);
app.use(regionFlow);

// 지도 api
const map = require('./routes/map/map');
const youtuberSearch = require('./routes/map/youtuberSearch');
const store = require('./routes/map/store');
const storeDetail = require('./routes/map/storeDetail')

app.use(map);
app.use(youtuberSearch);
app.use(store);
app.use(storeDetail);

// flow api
const flowSearch = require('./routes/flow/flowSearch');


app.use(flowSearch);


// 포트 연결
app.listen(PORT, function(){
  console.log('server on! http://localhost:'+PORT);
});