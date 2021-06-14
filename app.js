require('dotenv').config();
const express       = require('express');
const app           = express();
const passport      = require('passport');
const session       = require('express-session');
const mongoose      = require('mongoose');
const cors          = require('cors');
const algo          = require("./routes/db/algo")    // 알고리즘 용도

const PORT = process.env.PORT;

// 관리자용 로그인
// const LocalStrategy = require('passport-local').Strategy
// const bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({extended:false}))

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

// 로그인 라우트
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

app.use('/admin/login', loginRouter);
app.use('/admin/userTb', userTbRouter);
app.use('/admin/adminTb', adminTbRouter);
app.use('/admin/adminTagTb', adminTagTbRouter);
app.use('/admin/userTagTb', userTagTbRouter);
app.use('/admin/ytbReqTb', ytbReqTbRouter);
app.use('/admin/ytbCrawlingTb', ytbCrawlingTbRouter);
app.use('/admin/ytbStoreTb', ytbStoreTbRouter);
app.use('/admin/ytbChannelTb', ytbChannelTbRouter);
app.use('/admin/attractionCrawlingTb', attractionCrawlingTbRouter);
app.use('/admin/attractionTb', attractionTbRouter);
app.use('/admin/shareFlowTb', shareFlowTbRouter);
app.use('/admin/searchTb', searchTbRouter);

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
const userFlow = require('./routes/flow/userFlow');
const shareFlow = require('./routes/flow/shareFlow');


app.use(flowSearch);
app.use(userFlow);
app.use(shareFlow);

// 유튜버 상세 페이지
const youtuber = require('./routes/youtuber/youtube');

app.use(youtuber);

// 포트 연결
// app.listen(PORT, function(){
//   console.log('server on! http://localhost:'+ PORT);
// });

// 포트 연결 - 소켓 버전
const server = app.listen(PORT, function(){
  console.log('server on! http://localhost:'+ PORT);
});

const io = require("socket.io")(server, {
  handlePreflightRequest: (req, res) => {
      const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": process.env.SOCKET_URL, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
  }
});

var access = false;

// socket io 글로벌화
global.io = io;
// 관리자 접속 여부 글로벌화
global.access = access;

// // 사용자가 접속 중인지 아닌지 판별
// var access = false

const YtbCrawlingTb = require('./models/ytbCrawlingTb.model');

const socket = require('./socket');

socket(io);

setInterval(function() {
  console.log("2초 시간마다 계속 실행됩니다.");
  io.emit('test', 'socket test')
}, 5000);

// // 관리자가 데이터수집 페이지에 접속 중일 때
// io.on('connection', (socket) => {
//   access = true
//   console.log('admin join')
//   socket.emit('first', 'admin join');
  
//   socket.on('givedata', (msg) => {
//     console.log(msg)
//     // // 아래 saveYoutuber, saveVideo의 알고리즘은 수정이 필요함
//     // algo.saveYoutuber(YtbCrawlingTb, "문복희2", "../images/test.jpg", "https://www.youtube.com/channel/UCoLQZ4ZClFqVPCvvjuiUSRA",
//     // 5120001, 24400000, 3)
//     // algo.saveVideo(YtbCrawlingTb, "문복희2", "촉촉한 팬케이크에 푸짐한 샌드위치", "../images/test.jpg", "https://www.youtube.com/watch?v=B_GRymHuLhw",
//     // 660597, "2020-11-19", [ "각국어", "번역", "자막", "제작", ":", "컨텐츠", "제작", "의", "마무리", "는", "컨텐츠플라이", "!"], "완료", "대구광역시",
//     // "아웃백스테이크하우스 대구황금점", "대구광역시 수성구 황금동 동대구로 219", "맛집", 35.84987200777492, 128.6244778213711)

//     // // 결과 데이터 전송
//     // algo.sockets(YtbCrawlingTb).then(function(result) {
//     //   // console.log(result) // "Some User token"
//     //   socket.emit('result', result);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
//     // })

//     // 프론트와 통신 테스트
//     socket.emit('result', msg);
//     console.log('admin give me result data')
//   });

//   // 관리자가 데이터수집 페이지에서 나갔을 때 
//   socket.on('disconnect', (msg) => {
//     access = false
//     console.log('admin disconnect')

//     // 프론트와의 통신 테스트
//     socket.emit('end', msg);

//     // 아래 saveYoutuber, saveVideo의 알고리즘은 수정이 필요함
//     // algo.saveYoutuber(YtbCrawlingTb, "문복희2", "../images/test.jpg", "https://www.youtube.com/channel/UCoLQZ4ZClFqVPCvvjuiUSRA",
//     // 5120000, 24400000, 3)
//     // algo.saveVideo(YtbCrawlingTb, "문복희2", "촉촉한 팬케이크에 푸짐한 샌드위치", "../images/test.jpg", "https://www.youtube.com/watch?v=B_GRymHuLhw",
//     // 660597, "2020-11-19", [ "각국어", "번역", "자막", "제작", ":", "컨텐츠", "제작", "의", "마무리", "는", "컨텐츠플라이", "!"], "완료", "대구광역시",
//     // "아웃백스테이크하우스 대구황금점", "대구광역시 수성구 황금동 동대구로 219", "맛집", 35.84987200777492, 128.6244778213711)
//   });
// });