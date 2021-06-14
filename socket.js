const algo          = require("./routes/db/algo")    // 알고리즘 용도
const YtbCrawlingTb = require('./models/ytbCrawlingTb.model');
// var access          = require("./adminAccess")

function a(socket) {
    socket.emit('test', 'socket test')
}

let socket = (io) => {
    // 관리자가 데이터수집 페이지에 접속 중일 때
    io.on('connection', (socket) => {
        // console.log('------------------------------------')
        // access = true
        admin = socket;
        global.admin = admin;

        // console.log(access)
        // global.access = access
        console.log('admin join')
        // console.log('what is access?')
        // console.log(access.adminAccess)

        socket.emit('start', 'admin join');

        // socket test 코드
        setInterval(a(socket), 3000)

        // socket.on('givedata', (msg) => {
        //     // console.log(msg)
        //     // // 아래 saveYoutuber, saveVideo의 알고리즘은 수정이 필요함
        //     // algo.saveYoutuber(YtbCrawlingTb, "문복희2", "../images/test.jpg", "https://www.youtube.com/channel/UCoLQZ4ZClFqVPCvvjuiUSRA",
        //     // 5120001, 24400000, 3)
        //     // algo.saveVideo(YtbCrawlingTb, "문복희2", "촉촉한 팬케이크에 푸짐한 샌드위치", "../images/test.jpg", "https://www.youtube.com/watch?v=B_GRymHuLhw",
        //     // 660597, "2020-11-19", [ "각국어", "번역", "자막", "제작", ":", "컨텐츠", "제작", "의", "마무리", "는", "컨텐츠플라이", "!"], "완료", "대구광역시",
        //     // "아웃백스테이크하우스 대구황금점", "대구광역시 수성구 황금동 동대구로 219", "맛집", 35.84987200777492, 128.6244778213711)
        //     // algo.minusVideo(YtbCrawlingTb, "문복희2")
        
        //     // 결과 데이터 전송
        //     // algo.sockets(YtbCrawlingTb).then(function(result) {
        //     //     socket.emit('result', result);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
        //     // })
        
        //     // 프론트와 통신 테스트
        //     // socket.emit('result', msg);
        //     console.log('admin give me result data')
        // });
        socket.on('plz', (msg) => {
            console.log('plz : ' + msg)
        });
    
        // 관리자가 데이터수집 페이지에서 나갔을 때 
        socket.on('disconnect', (msg) => {
            // access = false
            // console.log(access)
            // global.access = access
            console.log('admin disconnect')
            // console.log(access.adminAccess)
        });
    });
}

module.exports = socket;
