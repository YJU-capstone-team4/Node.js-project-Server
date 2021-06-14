const mongoose = require('mongoose');
var access          = require("../../adminAccess")

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

// 관리자 접속 중일 때 프론트에 데이터 전송해야할 것! - 완료
async function sendFront(YtbCrawlingTb) {
    sockets(YtbCrawlingTb).then(function(result) {
        io.emit('result', result);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
        console.log('result event : ' + result)
    })
}

exports.sendFront = sendFront

// 관리자 접속 중일 때 프론트에 데이터 전송해야할 것! - 에러
async function sendFrontError(ytbChannel, videoName) {
    var a = {
        'ytbChannel': ytbChannel,
        'videoName': videoName
    }
    io.emit('errVideo', a);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
    console.log('errVideo event : ' + a)
}

exports.sendFrontError = sendFrontError

// 크롤링서버 -> 백엔드 유튜버 저장
async function saveYoutuber(YtbCrawlingTb, res, channel, profile, link, sub, hits, videocount) {
    try {
        // 여기서 민혁이 코드 실행시킬 것 / 비디오 제외 유튜버 값 받아오기

        // 들어가는 값들은 전부 민혁이코드.값이 될 것임
        var checkYoutuber = await YtbCrawlingTb.findOne({ ytbChannel: channel })

        if (checkYoutuber == null) {
            YtbCrawlingTb.create({
                _id: new mongoose.Types.ObjectId(),
                ytbChannel: channel,
                ytbProfile: profile,
                ytbLinkAddress: link,
                ytbSubscribe: sub,
                ytbHits: hits,
                videoCount: videocount,
                video: [],
            });
            res.status(200).json('유튜버 DB에 저장 성공')
            console.log('유튜버 DB에 저장 성공')
        } else {
            console.log('유튜버 데이터가 이미 존재합니다.')
            YtbCrawlingTb.update({ ytbChannel: channel }, {
                ytbProfile: profile,
                ytbLinkAddress: link,
                ytbSubscribe: sub,
                ytbHits: hits,
                videoCount: videocount
            }).exec();
            res.status(200).json('유튜버 DB에 video 제외 데이터 수정 성공')
            console.log('유튜버 DB에 video 제외 데이터 수정 성공')
        }

    } catch (err) {
        res.status(500).json({
            err : 'Internal Server Error'
        })
        console.log(err)
        console.log('유튜버에 DB 저장 실패')
    }
}

exports.saveYoutuber = saveYoutuber;

// 크롤링 서버 -> 백엔드 비디오 저장
async function saveVideo(YtbCrawlingTb, res, channel, videoName, thumbnail, ytbAddress, hits, date, more,
    status, regionTag, storeName, storeAddress, typeStore, lat, lng) {
    try {
        // 여기서 민혁이 코드 실행시킬 것 / 비디오 제외 유튜버 값 받아오기

        // 들어가는 값들은 전부 민혁이코드.값이 될 것임
        var videos = []

        var checkVideos = await YtbCrawlingTb.findOne({ "video.ytbVideoName" : { $eq : videoName } })

        if (checkVideos == null) {
            videos.push({
                "storeInfo": {
                    "location": {
                        "lat": lat,
                        "lng": lng
                    },
                    "storeName": storeName,
                    "storeAddress": storeAddress,
                    "typeStore": typeStore
                },
                "ytbVideoName": videoName,
                "ytbThumbnail": thumbnail,
                "ytbAddress": ytbAddress,
                "hits": hits,
                "uploadDate": date,
                "more": more,
                "status": status,
                "regionTag": regionTag
            })

            YtbCrawlingTb.update({ ytbChannel : channel }, { $push : { video : videos } }).exec()
            
            res.status(200).json('유튜버 DB 영상 저장 성공')
            console.log('유튜버 DB 영상 저장 성공')

        } else {
            // tip :: 영상이 같으면 수정해야할 필요가 있을 수도 있음
            res.status(200).json('유튜버 DB에 영상이 이미 존재합니다.')
            console.log('유튜버 DB에 영상이 이미 존재합니다.')
        }

    } catch (err) {
        
        console.log(err)
        res.status(500).json({
            err : 'Internal Server Error'
        })
        console.log('유튜버 DB에 영상 저장 실패')
    }
}

exports.saveVideo = saveVideo;

// 데이터 수집 메인 페이지 - 유료광고 영상일 시 videoCount - 1
async function minusVideo(YtbCrawlingTb, channel) {
    try {
        // 여기서 민혁이 코드 실행시킬 것 / 비디오 제외 유튜버 값 받아오기

        // 들어가는 값들은 전부 민혁이코드.값이 될 것임
        var checkYoutuber = await YtbCrawlingTb.findOne({ ytbChannel: channel })
        var count = checkYoutuber.videoCount - 1

        YtbCrawlingTb.update({ ytbChannel: channel }, {
            videoCount: count
        }).exec();
        console.log('유료광고 영상에 따른 videoCount - 1 성공')
        console.log(access.adminAccess)

    } catch (err) {
        // res.status(500).json({
        //     error : err
        // })
        console.log(err)
        console.log('유료광고 영상에 따른 videoCount - 1 실패')
    }
}

exports.minusVideo = minusVideo;