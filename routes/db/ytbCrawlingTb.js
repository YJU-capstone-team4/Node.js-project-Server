const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbCrawlingTb = require('../../models/ytbCrawlingTb.model');
const YtbChannelTb = require('../../models/ytbChannelTb.model');
const YtbStoreTb = require('../../models/ytbStoreTb.model');
const algo = require("./algo");
const apps = require("../../app");
const socket = require("../../socket");
const { adminStore } =  require('../../crawling/youtube/adminStore')

// 데이터 수집 페이지 메인
router.get('/socket', async (req, res, next) => {
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

        // console.log(array)

        res.status(200).json(array)
    } catch (err) {
        res.status(500).json({
            error : 'Internal Server Error'
        })
    }
});

// 에러 해결 메인페이지 통합 - 좌측, 우측
router.get('/error/:channelId', async (req, res, next) => {
    try {
        var errCrawling = await YtbCrawlingTb.aggregate([
            {
              "$match": { 'ytbChannel' : req.params.channelId }
            },
            {
                "$set": {
                  "video": {
                    "$filter": {
                      "input": "$video",
                      "as": "v",
                      "cond": {"$eq": ["$$v.status","에러"]}
                    }
                  }
                }
            }
        ])

        res.status(200).json(errCrawling)
    } catch (err) {
        res.status(500).json({
            error : 'Internal Server Error'
        })
    }
});

// 삭제 버튼 클릭 시 배열 안 해당 영상 삭제
router.delete('/video/delete/:channelId/:videoId', async (req, res, next) => {
    try {
        var ytbCrawlingTb = await YtbCrawlingTb.findOne({ 'ytbChannel': req.params.channelId }) 

        YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, 
        { $pull: { 'video' : { '_id' : req.params.videoId } } }).exec()

        YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, 
        { 'videoCount' : ytbCrawlingTb.videoCount-1 } ).exec()

        res.status(200).json('delete Success')
    }
    catch (err) {
        res.status(500).json(
            'Internal Server Error'
        );
    }
});

// < 주소 전달 > 프론트 -> 백 -> 크롤링 서버 => 민혁 코드 추가하면 됨
// router.post('/address/search/:addressId', async (req, res, next) => {
//     try {
//         // 민혁이에게 req.params.addressId를 보내는 로직을 짜야 함 - 수정
//         // 현재는 코드 실행이지만 후에는 fetch를 사용하여 html 통신으로 보내야 함 - 수정
        
//         console.log(req.params.addressId)
//         var result = await adminStore(req.params.addressId) // 3사 지도 크롤링 결과

//         // 이건 나중에 민혁이에게서 받아오는 데이터를 전송할 것임 - 수정
//         res.status(200).json(result)
//     } catch (err) {
//         res.status(500).json({
//             error : 'Internal Server Error'
//         })
//     }
// });

// < 주소 전달 > 크롤링 -> 백 -> 프론트 서버
// router.post('/address/crawling/search', async (req, res, next) => {
//     try {
//         // 민혁이에게 req.params.addressId를 보내는 로직을 짜야 함 - 수정
//         // 현재는 코드 실행이지만 후에는 fetch를 사용하여 html 통신으로 보내야 함 - 수정

//         // console.log(req.params.addressId)
//         // var result = await adminStore(req.params.addressId) // 3사 지도 크롤링 결과
        
//         // array = []

//         // for( i = 0; i < 3; i++) {
//         //     array.push({
//         //         'crawlingPlatform': req.body.addressData[i].crawlingPlatform,
//         //         'data' : req.body.addressData[i].data
//         //     })
//         // }
//         console.log('crawlingPlatform : ', req.body.crawlingPlatform)

//         addressData = {
//             "crawlingPlatform" : req.body.crawlingPlatform,
//             "data": [
//                 {
//                     "crawlingStore": req.body.crawlingStore,
//                     "address": req.body.address,
//                     "crawlingLocation": {
//                         "lat": req.body.lat,
//                         "lng": req.body.lng
//                     }
//                 }
//             ]
//         }

//         console.log(addressData)

//         io.emit('addressData', addressData);

//         res.status(200).json({
//             message : "전송 성공"
//         })
//     } catch (err) {
//         res.status(500).json({
//             error : 'Internal Server Error'
//         })
//     }
// });

// // < 주소 전달 > 크롤링 -> 백 -> 프론트 서버2
// var addressData = []
// router.post('/address/crawling/search', async (req, res, next) => {
//     try {
//         console.log('crawlingPlatform : ', req.body.crawlingPlatform)
//         if (req.body.crawlingPlatform == 'Google') {
//             addressData = []
//         }

//         addressData.push({
//             "crawlingPlatform" : req.body.crawlingPlatform,
//             "data": [
//                 {
//                     "crawlingStore": req.body.crawlingStore,
//                     "address": req.body.address,
//                     "crawlingLocation": {
//                         "lat": req.body.lat,
//                         "lng": req.body.lng
//                     }
//                 }
//             ]
//         })

//         console.log(addressData)

//         if(req.body.crawlingPlatform == 'Kakao') {
//             io.emit('addressData', addressData);
//             console.log("addressData 전송 성공")
//         } else {
//             console.log("addressData 저장 성공")
//         }
        
//         res.status(200).json({
//             message : "3사 검색 성공"
//         })
//     } catch (err) {
//         res.status(500).json({
//             error : 'Internal Server Error'
//         })
//     }
// });

// // < 주소 전달 > 크롤링 -> 백 -> 프론트 서버3
// var addressData = []
// var plat = ['Google', 'Naver', "Kakao"]
// // for(var i = 0; i < 3; i++) {
//     // addressData.push({
//     //     "crawlingPlatform" : plat[i],
//     //     "data": [
//     //         {
//     //             "crawlingStore": '',
//     //             "address": '',
//     //             "crawlingLocation": {
//     //                 "lat": 0,
//     //                 "lng": 0
//     //             }
//     //         }
//     //     ]
//     // })
// // }
// router.post('/address/crawling/search', async (req, res, next) => {
//     try {
//         console.log('crawlingPlatform : ', req.body.crawlingPlatform)
//         if (req.body.crawlingPlatform == 'Google') {
//             addressData = []
//         }

//         addressData.push({
//             "crawlingPlatform" : req.body.crawlingPlatform,
//             "data": [
//                 {
//                     "crawlingStore": req.body.crawlingStore,
//                     "address": req.body.address,
//                     "crawlingLocation": {
//                         "lat": req.body.lat,
//                         "lng": req.body.lng
//                     }
//                 }
//             ]
//         })

//         console.log(addressData)

//         if(req.body.crawlingPlatform == 'Kakao') {
//             if (addressData[1].crawlingPlatform != 'Naver') {
//                 addressData.pop()

//                 addressData.push({
//                     "crawlingPlatform" : 'Naver',
//                     "data": [
//                         {
//                             "crawlingStore": '',
//                             "address": '',
//                             "crawlingLocation": {
//                                 "lat": 0,
//                                 "lng": 0
//                             }
//                         }
//                     ]
//                 })

//                 addressData.push({
//                     "crawlingPlatform" : req.body.crawlingPlatform,
//                     "data": [
//                         {
//                             "crawlingStore": req.body.crawlingStore,
//                             "address": req.body.address,
//                             "crawlingLocation": {
//                                 "lat": req.body.lat,
//                                 "lng": req.body.lng
//                             }
//                         }
//                     ]
//                 })
//             }

//             io.emit('addressData', addressData);
//             console.log("addressData 전송 성공")
//         } else {
//             console.log("addressData 저장 성공")
//         }
        
//         res.status(200).json({
//             message : "3사 검색 성공"
//         })
//     } catch (err) {
//         res.status(500).json({
//             error : 'Internal Server Error'
//         })
//     }
// });

// < 주소 전달 > 크롤링 -> 백 -> 프론트 서버4
var addressData = []
router.post('/address/crawling/search', async (req, res, next) => {
    try {
        console.log('crawlingPlatform : ', req.body.crawlingPlatform)
        if (req.body.crawlingPlatform == 'Google') {
            addressData = []
        }

        addressData.push({
            "crawlingPlatform" : req.body.crawlingPlatform,
            "data": [
                {
                    "crawlingStore": req.body.crawlingStore,
                    "address": req.body.address,
                    "crawlingLocation": {
                        "lat": req.body.lat,
                        "lng": req.body.lng
                    }
                }
            ]
        })

        console.log(addressData)

        if(addressData.length == 3) {
            io.emit('addressData', addressData);
            console.log("addressData 전송 성공")
        } else {
            console.log("addressData 저장 성공")
        }
        
        res.status(200).json({
            message : "3사 검색 성공"
        })
    } catch (err) {
        res.status(500).json({
            error : 'Internal Server Error'
        })
    }
});

// 3사 결과 비디오 저장 시
router.post('/save/video/:channelId', async (req, res, next) => {
    
    // res.status(200).json(req.body.video[0]._id)
    const ytbCrawling = await YtbCrawlingTb.findOne({ 'video._id' : req.body.video[0]._id });

    var a = await YtbCrawlingTb.findOne( { $and : [ { 'ytbChannel': req.params.channelId },
            { 'video._id': req.body.video[0]._id } ] },
            {
                "_id": 0,
                "video": { $elemMatch:{ '_id' : req.body.video[0]._id } }
            })

    var videos = []

    videos.push({
        _id: req.body.video[0]._id,
        more: a.video[0].more,
        ytbVideoName: a.video[0].ytbVideoName,
        ytbThumbnail: a.video[0].ytbThumbnail,
        ytbAddress: a.video[0].ytbAddress,
        hits: a.video[0].hits,
        uploadDate: a.video[0].uploadDate,
        storeInfo: req.body.video[0].storeInfo,
        status: req.body.video[0].status,
        regionTag: req.body.video[0].regionTag
    })

    // if(ytbCrawling != null) {
    //     res.status(200).json({ video : videos })
    // }

    var b = await YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $pull : { video : { _id : req.body.video[0]._id } } }).exec()

    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $push : { video : videos } }).exec()

    res.status(200).json(b)
});

// 크롤링 완료된 유튜버 ytbChannelTb, ytbStoreTb에 나눠 저장
router.post('/save/youtuber/:channelId', async (req, res, next) => {

    // ytbCrawlingTb에서 저장 클릭 시 데이터 변수에 저장
    const ytbCrawling = await YtbCrawlingTb.findOne({ 'ytbChannel' : req.params.channelId });

    // 크롤링 비디오 데이터
    var crawVideo = await YtbCrawlingTb.findOne({
        "ytbChannel": req.params.channelId
    },{
        "_id": 0,
        "video": 1
    })

    // 크롤링 유튜버 데이터
    var crawYoutuber = await YtbCrawlingTb.findOne({ "ytbChannel": req.params.channelId })

    // ytbStoreTb에 저장 - 데이터 존재 시 저장 X
    for(let i = 0; i < crawVideo.video.length; i++) {
        var storeExist = await YtbStoreTb.findOne({ $and : [{ 'storeInfo.storeName' : crawVideo.video[i].storeInfo.storeName },
                    { 'storeInfo.storeAddress' : crawVideo.video[i].storeInfo.storeAddress }]});
        // 데이터 존재 X시
        if (storeExist == null) {
            var ytbStoreTb = new YtbStoreTb({
                _id: new mongoose.Types.ObjectId(),
                storeInfo: {
                    storeName: crawVideo.video[i].storeInfo.storeName,
                    storeAddress: crawVideo.video[i].storeInfo.storeAddress,
                    location: {
                        lat: crawVideo.video[i].storeInfo.location.lat,
                        lng: crawVideo.video[i].storeInfo.location.lng,
                    },
                    typeStore: crawVideo.video[i].storeInfo.typeStore,
                },
                regionTag: crawVideo.video[i].regionTag
            });
            ytbStoreTb.save()
        } else {
            console.log('data is already exist');
        }
    }

    // ytbChannelTb에 저장 - 데이터 존재 X시 저장, 데이터 존재 시 수정
    const youtuberExist = await YtbChannelTb.findOne({ 'ytbChannel' : crawYoutuber.ytbChannel });

    // 데이터 존재 X시
    if (youtuberExist == null) {
        var videos = []
        for(let i = 0; i < crawYoutuber.video.length; i++) {
            var storeCheck = await YtbStoreTb.findOne({ $and : [{ 'storeInfo.storeName' : crawYoutuber.video[i].storeInfo.storeName },
            { 'storeInfo.storeAddress' : crawYoutuber.video[i].storeInfo.storeAddress }]})
            videos.push({
                ytbVideoName: crawYoutuber.video[i].ytbVideoName,
                ytbThumbnail: crawYoutuber.video[i].ytbThumbnail,
                ytbAddress: crawYoutuber.video[i].ytbAddress,
                ytbStoreTbId: storeCheck._id,
                storeId: (String)(storeCheck._id),
                hits: crawYoutuber.video[i].hits,
                hitsIncrease: crawYoutuber.video[i].hits,
                rank: 0,
                rankIncrease: 0,
                uploadDate: crawYoutuber.video[i].uploadDate
            })
        }

        YtbChannelTb.create({ 
            _id: new mongoose.Types.ObjectId(),
            ytbChannel: crawYoutuber.ytbChannel,
            ytbProfile: crawYoutuber.ytbProfile,
            ytbLinkAddress: crawYoutuber.ytbLinkAddress,
            ytbSubscribe: crawYoutuber.ytbSubscribe,
            ytbSubIncrease: crawYoutuber.ytbSubscribe,
            ytbHits: crawYoutuber.ytbHits,
            ytbRank: 0,
            ytbRankIncrease: 0,
            likeCount: 0,
            video: videos
         })     
        
        console.log('youtuber created')
        res.status(200).json('youtuber created');
        
    } 
    // 데이터가 존재할 시
    else {
        var updated = await YtbChannelTb.find({ 'ytbChannel': crawYoutuber.ytbChannel })
        var videos = []
        for(let i = 0; i < crawYoutuber.video.length; i++) {
            // 영상 데이터가 존재하는가?
            var b = await YtbChannelTb.findOne( { $and : [ { 'ytbChannel': crawYoutuber.ytbChannel },
            { 'video.ytbVideoName': crawYoutuber.video[0].ytbVideoName } ] },
            {
                "_id": 0,
                "video": { $elemMatch:{ ytbVideoName : crawYoutuber.video[0].ytbVideoName } }
            })

            var storeCheck = await YtbStoreTb.findOne({ $and : [{ 'storeInfo.storeName' : crawYoutuber.video[i].storeInfo.storeName },
            { 'storeInfo.storeAddress' : crawYoutuber.video[i].storeInfo.storeAddress }]})

            if (b != null) {
                videos.push({
                    ytbVideoName: crawYoutuber.video[i].ytbVideoName,
                    ytbThumbnail: crawYoutuber.video[i].ytbThumbnail,
                    ytbAddress: crawYoutuber.video[i].ytbAddress,
                    ytbStoreTbId: storeCheck._id,
                    storeId: (String)(storeCheck._id),
                    hits: b.video[0].hitsIncrease,
                    hitsIncrease: crawYoutuber.video[i].hits,
                    rank: b.video[0].rankIncrease,
                    rankIncrease: 0,
                    uploadDate: crawYoutuber.video[i].uploadDate
                })
            } else {
                videos.push({
                    ytbVideoName: crawYoutuber.video[i].ytbVideoName,
                    ytbThumbnail: crawYoutuber.video[i].ytbThumbnail,
                    ytbAddress: crawYoutuber.video[i].ytbAddress,
                    ytbStoreTbId: storeCheck._id,
                    storeId: (String)(storeCheck._id),
                    hits: crawYoutuber.video[i].hits,
                    hitsIncrease: crawYoutuber.video[i].hits,
                    rank: 0,
                    rankIncrease: 0,
                    uploadDate: crawYoutuber.video[i].uploadDate
                })
            }
        }

        // 일치하는 유튜버 찾기
        var a = await YtbChannelTb.findOne({ 'ytbChannel': crawYoutuber.ytbChannel })

        // 일치하는 영상 찾기
        var b = await YtbChannelTb.findOne( { $and : [ { 'ytbChannel': crawYoutuber.ytbChannel },
                    { 'video.ytbVideoName': crawYoutuber.video[0].ytbVideoName } ] },
                    {
                        "_id": 0,
                        "video": { $elemMatch:{ ytbVideoName : crawYoutuber.video[0].ytbVideoName } }
                    })

        YtbChannelTb.update({ 'ytbChannel': crawYoutuber.ytbChannel }, { 
            ytbProfile: crawYoutuber.ytbProfile,
            ytbLinkAddress: crawYoutuber.ytbLinkAddress,
            ytbSubscribe: a.ytbSubIncrease,
            ytbSubIncrease: crawYoutuber.ytbSubscribe,
            ytbHits: crawYoutuber.ytbHits,
            ytbRank: a.ytbRankIncrease,
            ytbRankIncrease: 0,
            likeCount: a.likeCount,
            video: videos
         }).exec()

        console.log('youtuber updated')
        res.status(200).json('youtuber updated');
    }

    // 변수에 담은 뒤 신청 유튜버에서 삭제 
    YtbCrawlingTb.remove({ 'ytbChannel' : req.params.channelId }).exec();
});

// 크롤링 데이터 생성용
router.post('/', (req, res, next) => {
    const ytbCrawlingTb = new YtbCrawlingTb({
      _id: new mongoose.Types.ObjectId(),
      ytbChannel: req.body.ytbChannel,
      ytbProfile: req.body.ytbProfile,
      ytbLinkAddress: req.body.ytbLinkAddress,
      ytbSubscribe: req.body.ytbSubscribe,
      ytbHits: req.body.ytbHits,
      videoCount: req.body.videoCount,
      video: req.body.video,
    });
    ytbCrawlingTb.save()
    .then(result => {
        res.status(201).json({
            message: 'Created ytbCrawlingTb successfully',
            createdYtbCrawlingTbId: {
                _id: result._id,
                ytbChannel: result.ytbChannel,
                ytbProfile: result.ytbProfile,
                ytbLinkAddress: result.ytbLinkAddress,
                ytbSubscribe: result.ytbSubscribe,
                ytbHits: result.ytbHits,
                videoCount: result.videoCount,
                video: result.video,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/attractionCrawlingTb/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

// 유튜브 videoCount 삭제 테스트
// router.post('/test/:channelId', (req, res, next) => {
//     algo.minusVideo(YtbCrawlingTb, req.params.channelId)

//     res.status(200).json(req.params.channelId + "'s video -1 is successed")
// });

// 소켓 데이터 전송 테스트
router.post('/test', (req, res, next) => {
    // socket(app.io).sendResult()
    // console.log(io)

    algo.sendFront(YtbCrawlingTb)
    res.status(200).json('소켓 데이터 전송')
});


/******************************************
 * 크롤링 서버 용
 ******************************************/

// 크롤링 서버로부터 유튜버만 저장
router.post('/crawling/save/youtuber', (req, res, next) => {
    algo.saveYoutuber(YtbCrawlingTb, res, req.body.channel, req.body.profile, req.body.link, req.body.sub, 
        req.body.hits, req.body.videocount)
});

// 크롤링 서버로부터 유튜버에 해당하는 비디오 저장
router.post('/crawling/save/video', async (req, res, next) => {    
    if (req.body.charged == true) {
        // console.log('전 charged : ', req.body.charged)
        // console.log('전 channel : ', req.body.channel)
        await algo.minusVideo(YtbCrawlingTb, req.body.channel)
        // await console.log('유료광고 또는 더보기란 주소 없음으로 영상 수 -1')
        res.status(200).json('영상 제외')
    } else {
        await algo.saveVideo(YtbCrawlingTb, res, req.body.channel, req.body.videoName, req.body.thumbnail, 
            req.body.ytbAddress, req.body.hits, req.body.date, req.body.more, req.body.status, req.body.regionTag, 
            req.body.storeName, req.body.storeAddress, req.body.typeStore, req.body.lat, req.body.lng)

        await algo.sendFront(YtbCrawlingTb)
    }
    
    // // 비디오 갯수 계산
    // var errCount = 0;
    // var completeCount = 0;

    // // 프론트 전송 폼
    // var array = []

    // // ytbCrawlingTb 전체
    // var data = await YtbCrawlingTb.find()

    // for(let i = 0; i < data.length; i++) {
    //     for(let j = 0; j < data[i].video.length; j++) {
    //         if(data[i].video[j].status == "에러") {
    //             errCount++;
    //         } else if (data[i].video[j].status == "완료") {
    //             completeCount++;
    //         }
    //     }
    //     array.push({
    //         ytbChannel: data[i].ytbChannel,
    //         ytbProfile: data[i].ytbProfile,
    //         videoCount: data[i].videoCount,
    //         errCount: errCount,
    //         completeCount: completeCount
    //     })
    //     errCount = 0;
    //     completeCount = 0;
    // }
    
    // // 비디오 status에 따라 소켓 전송
    // if (req.body.status == '완료') {
    //     sockets(YtbCrawlingTb).then(function(result) {
    //         io.emit('result', array);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
    //         console.log('result event : ' + result)
    //     })
    // }
    // else if (req.body.status == '에러') {
    //     sockets(YtbCrawlingTb).then(function(a) {
    //         io.emit('errVideo', array);  // emit을 사용하여 sockets이라는 함수에서 나온 결과값 보냄
    //         console.log('errVideo event : ' + a)
    //     })
    // }
});

module.exports = router;
