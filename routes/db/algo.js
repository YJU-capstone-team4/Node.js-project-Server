const mongoose = require('mongoose');

// pagination 함수
async function pagination(req, res, Collection) {
    const { page = 1, limit = 10 } = req.query;
    const whole = await Collection.find();        // shareFlowTb 전체 값

    // 페이지네이션을 위한 몽고DB 쿼리
    const collection = await Collection.find()
    .limit(limit * 1)
    .skip((page-1) * limit);

    // 페이지 그룹
    const pageCount = 5;                          // 페이지 그룹에 보일 페이지 수
    var pageGroup = Math.ceil(page/pageCount);    // 현재 페이지 그룹 위치
    const totalPage = Math.ceil(whole.length/limit);  // 전체 페이지 수

    var last = pageGroup * pageCount;             // 화면에 보여질 페이지 맨 뒤 숫자
    if (last > totalPage)
        last = totalPage
    var first = last - (pageCount - 1);           // 화면에 보여질 페이지 맨 앞 숫자
    if (first < 1)
        first = 1

    var next = last + pageCount;
    if (next > (totalPage/pageCount) * pageCount || next < pageCount + 1)
        next = null;
    var prev = first - pageCount;
    if (prev < 1)
        prev = null;

    res.status(200).json({
        total: whole.length,        // 전체 Document 갯수
        current: collection.length, // 현재 페이지의 Document 갯수
        totalPage : totalPage,      // 전체 페이지 갯수
        page: page,                 // 현재 페이지
        first: first,               // 화면에 보여질 페이지 맨 앞 숫자
        last: last,                 // 화면에 보여질 페이지 맨 뒤 숫자
        next: next,                 // 다음 버튼
        prev: prev,                 // 이전 버튼
        collection
    })
}

exports.pagination = pagination;

// pagination 함수 - 검색
async function paginationSearch(req, res, Collection, where, searchValue) {
    var query = {}
    query[where] = { $regex : searchValue };    // $regex : like
    
    const { page = 1, limit = 10 } = req.query;
    const whole = await Collection.find( query );        // shareFlowTb 전체 값

    // 페이지네이션을 위한 몽고DB 쿼리
    const collection = await Collection.find( query )
    .limit(limit * 1)
    .skip((page-1) * limit);

    // 페이지 그룹
    const pageCount = 5;                          // 페이지 그룹에 보일 페이지 수
    var pageGroup = Math.ceil(page/pageCount);    // 현재 페이지 그룹 위치
    const totalPage = Math.ceil(whole.length/limit);  // 전체 페이지 수

    var last = pageGroup * pageCount;             // 화면에 보여질 페이지 맨 뒤 숫자
    if (last > totalPage)
        last = totalPage
    var first = last - (pageCount - 1);           // 화면에 보여질 페이지 맨 앞 숫자
    if (first < 1)
        first = 1

    var next = last + pageCount;
    if (next > (totalPage/pageCount) * pageCount || next < pageCount + 1)
        next = null;
    var prev = first - pageCount;
    if (prev < 1)
        prev = null;

    // 데이터가 없을 때 에러 표시
    if (collection.length == 0)
        res.status(404).json({ error : searchValue + "is not founded" })
    else {
        res.status(200).json({
            total: whole.length,        // 전체 Document 갯수
            current: collection.length, // 현재 페이지의 Document 갯수
            totalPage : totalPage,      // 전체 페이지 갯수
            page: page,                 // 현재 페이지
            first: first,               // 화면에 보여질 페이지 맨 앞 숫자
            last: last,                 // 화면에 보여질 페이지 맨 뒤 숫자
            next: next,                 // 다음 버튼
            prev: prev,                 // 이전 버튼
            collection
        })
    }
}

exports.paginationSearch = paginationSearch;

// 데이터 수집 메인 페이지 - socket 알고리즘
async function sockets(YtbCrawlingTb) {
    try {
        var errCount = 0;
        var completeCount = 0;

        // 프론트 전송 폼
        var array = []

        // status가 에러인 유튜버와 영상 필터링
        // var error = await YtbCrawlingTb.find({ 'video.status' : '에러' })

        // ytbCrawlingTb 전체
        var data = await YtbCrawlingTb.find()

        for(let i = 0; i < data.length; i++) {
            for(let j = 0; j < data[i].video.length; j++) {
                if(data[i].video[j].status == "에러") {
                    errCount++;
                } else if (data[i].video[j].status == "완료") {
                    completeCount++;
                }
            }
            array.push({
                ytbChannel: data[i].ytbChannel,
                ytbProfile: data[i].ytbProfile,
                videoCount: data[i].videoCount,
                errCount: errCount,
                completeCount: completeCount
            })
            errCount = 0;
            completeCount = 0;
        }
        
        // return array;
        return new Promise(function (resolve) {
            resolve(array)
          })
        // res.status(200).json(array)
    } catch (err) {
        // res.status(500).json({
        //     error : err
        // })
        console.log('error')
    }
}

exports.sockets = sockets;

// 데이터 수집 메인 페이지 - socket 알고리즘 - DB에 유튜버 저장
async function saveYoutuber(YtbCrawlingTb) {
    try {
        // 여기서 민혁이 코드 실행시킬 것 / 비디오 제외 유튜버 값 받아오기

        // 들어가는 값들은 전부 민혁이코드.값이 될 것임
        var checkYoutuber = await YtbCrawlingTb.findOne({ ytbChannel: "문복희2" })

        if (checkYoutuber == null) {
            YtbCrawlingTb.create({
                _id: new mongoose.Types.ObjectId(),
                ytbChannel: "문복희2",
                ytbProfile: "../images/test.jpg",
                ytbLinkAddress: "https://www.youtube.com/channel/UCoLQZ4ZClFqVPCvvjuiUSRA",
                ytbSubscribe: 5120000,
                ytbHits: 24400000,
                videoCount: 3,
                video: [],
            });
            console.log('유튜버 DB에 저장 성공')
        } else {
            console.log('유튜버 데이터가 이미 존재합니다.')
        }

    } catch (err) {
        // res.status(500).json({
        //     error : err
        // })
        console.log(err)
        console.log('유튜버에 DB 저장 실패')
    }
}

exports.saveYoutuber = saveYoutuber;

// 데이터 수집 메인 페이지 - socket 알고리즘 - 해당 유튜버에 영상 저장
async function saveVideo(YtbCrawlingTb) {
    try {
        // 여기서 민혁이 코드 실행시킬 것 / 비디오 제외 유튜버 값 받아오기

        // 들어가는 값들은 전부 민혁이코드.값이 될 것임
        var videos = []

        var checkVideos = await YtbCrawlingTb.findOne({ "video.ytbVideoName" : "SUB)촉촉한 팬케이크에 푸짐한 샌드위치 에그스크램블 등 브런치 먹방!🥞🥪(ft.감자튀김) 리얼사운드 Pancake Sandwich Brunch mukbang ASMR", })

        if (checkVideos == null) {
            videos.push({
                "storeInfo": {
                    "location": {
                        "lat": 35.84987200777492,
                        "lng": 128.6244778213711
                    },
                    "storeName": "아웃백스테이크하우스 대구황금점",
                    "storeAddress": "대구광역시 수성구 황금동 동대구로 219",
                    "typeStore": "맛집"
                },
                "ytbVideoName": "SUB)촉촉한 팬케이크에 푸짐한 샌드위치 에그스크램블 등 브런치 먹방!🥞🥪(ft.감자튀김) 리얼사운드 Pancake Sandwich Brunch mukbang ASMR",
                "ytbThumbnail": "../images/test.jpg",
                "ytbAddress": "https://www.youtube.com/watch?v=B_GRymHuLhw",
                "hits": 660597,
                "uploadDate": "2020-11-19",
                "more": [ "각국어", "번역", "자막", "제작", ":", "컨텐츠", "제작", "의", "마무리", "는", "컨텐츠플라이", "!"],
                "status": "완료",
                "regionTag": "대구광역시"
            })

            YtbCrawlingTb.update({ ytbChannel : "문복희2" }, { $push : { video : videos } }).exec()
            console.log('유튜버 DB 영상 저장 성공')

        } else {
            console.log('유튜버 DB에 영상이 이미 존재합니다.')
        }

    } catch (err) {
        // res.status(500).json({
        //     error : err
        // })
        console.log(err)
        console.log('유튜버 DB에 영상 저장 실패')
    }
}

exports.saveVideo = saveVideo;