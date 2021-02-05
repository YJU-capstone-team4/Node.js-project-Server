require('dotenv').config();
const express   = require('express');
const app       = express();
const passport  = require('passport');
const session   = require('express-session');
const mongoose  = require('mongoose');
const cors      = require('cors');

const PORT = 3000;

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

// // 로그인 라우트
// app.use('/', require('./routes/main'));
// app.use('/auth', require('./routes/auth'));

app.use(cors());
app.use(express.json());

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