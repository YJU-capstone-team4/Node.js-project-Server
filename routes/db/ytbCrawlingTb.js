const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbCrawlingTb = require('../../models/ytbCrawlingTb.model');
const YtbChannelTb = require('../../models/ytbChannelTb.model');
const YtbStoreTb = require('../../models/ytbStoreTb.model');
const algo = require("./algo");
const { ObjectId } = require('bson');
const apps = require("../../app");

// // 데이터 수집 페이지 메인
// router.get('/socket', async (req, res, next) => {
//     try {
//         var normalCount = 0;
//         var errCount = 0;
//         var completeCount = 0;

//         // 크롤링 대기 데이터 목록
//         var normalCrawling = await YtbCrawlingTb.find()

//         var errCrawling = await YtbCrawlingTb.aggregate([
//             {
//               "$set": {
//                 "video": {
//                   "$filter": {
//                     "input": "$video",
//                     "as": "v",
//                     "cond": {"$eq": ["$$v.status","에러"]}
//                   }
//                 }
//               }
//             }
//         ])

//         // status가 완료인 유튜버들 및 영상들
//         var completeCrawling = await YtbCrawlingTb.aggregate([
//             {
//               "$set": {
//                 "video": {
//                   "$filter": {
//                     "input": "$video",
//                     "as": "v",
//                     "cond": {"$eq": ["$$v.status","완료"]}
//                   }
//                 }
//               }
//             }
//         ])

//         // status가 ''인 video 갯수 세기
//         for (var i = 0; i < normalCrawling.length; i++)
//             normalCount += normalCrawling[i].video.length

//         // status가 에러인 video 갯수 세기
//         for (var i = 0; i < errCrawling.length; i++)
//             errCount += errCrawling[i].video.length
        
//         // status가 완료인 video 갯수 세기
//         for (var i = 0; i < completeCrawling.length; i++)
//             completeCount += completeCrawling[i].video.length

//         res.status(200).json([
//             {
//                 status : 'normalCrawling',
//                 data : normalCrawling
//             },
//             {
//                 status : 'errCrawling',
//                 data : errCrawling,
//             },
//             {
//                 status : 'completeCrawling',
//                 data : completeCrawling
//             }
//         ])
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

// 데이터 수집 페이지 메인2
// router.get('/socket', async (req, res, next) => {
//     try {
//         var errCount = 0;
//         var completeCount = 0;

//         // 프론트 전송 폼
//         var array = []

//         // status가 에러인 유튜버와 영상 필터링
//         // var error = await YtbCrawlingTb.find({ 'video.status' : '에러' })

//         // ytbCrawlingTb 전체
//         var data = await YtbCrawlingTb.find()

//         for(let i = 0; i < data.length; i++) {
//             for(let j = 0; j < data[i].video.length; j++) {
//                 if(data[i].video[j].status == "에러") {
//                     errCount++;
//                 } else if (data[i].video[j].status == "완료") {
//                     completeCount++;
//                 }
//             }
//             array.push({
//                 ytbChannel: data[i].ytbChannel,
//                 ytbProfile: data[i].ytbProfile,
//                 videoCount: data[i].videoCount,
//                 errCount: errCount,
//                 completeCount: completeCount
//             })
//             errCount = 0;
//             completeCount = 0;
//         }

//         // console.log(array)

//         res.status(200).json(array)
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

// 데이터 수집 페이지 메인3 - 반드시 수정 필요!!
router.get('/socket', async (req, res, next) => {
    try {
        res.sendfile('./client.html');
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// // 에러 해결 메인 페이지 - 좌측
// router.get('/error', async (req, res, next) => {
//     try {
//         var errCount = 0;

//         // 에러가 발생한 자료들
//         var errCrawling = await YtbCrawlingTb.aggregate([
//             {
//               "$set": {
//                 "video": {
//                   "$filter": {
//                     "input": "$video",
//                     "as": "v",
//                     "cond": {"$eq": ["$$v.status","에러"]}
//                   }
//                 }
//               }
//             }
//         ])

//         // status가 에러인 video 갯수 세기
//         for (var i = 0; i < errCrawling.length; i++)
//             errCount += errCrawling[i].video.length

//         res.status(200).json({
//             status : 'errCrawling',
//             data : errCrawling
//             // errTotal: errCount,
//             // errCrawling
//         })
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

// // 에러 해결 메인 페이지 - 우측
// router.get('/error/:channelId', async (req, res, next) => {
//     try {
//         var more = await YtbCrawlingTb.findOne({
//             "ytbChannel": req.params.channelId
//         },{
//             "_id": 0,
//             "video": {
//                 "$elemMatch": {
//                     "status": '에러'
//                 }
//             }
//         })

//         res.status(200).json(more)
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

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
            error : err
        })
    }
});
// router.get('/error', async (req, res, next) => {
//     try {
//         var errCrawling = await YtbCrawlingTb.aggregate([
//             {
//               "$match": { 'video.status' : '에러' }
//             },
//             {
//                 "$set": {
//                   "video": {
//                     "$filter": {
//                       "input": "$video",
//                       "as": "v",
//                       "cond": {"$eq": ["$$v.status","에러"]}
//                     }
//                   }
//                 }
//             }
//         ])

//         res.status(200).json(errCrawling)
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

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
            err
        );
    }
});

// < 주소 전달 > 프론트 -> 백 -> 크롤링 서버
router.post('/address/search/:addressId', async (req, res, next) => {
    try {
        // 민혁이에게 req.params.addressId를 보내는 로직을 짜야 함 - 수정
        // 현재는 코드 실행이지만 후에는 fetch를 사용하여 html 통신으로 보내야 함 - 수정
        console.log(req.params.addressId)

        // const axios = require('axios'); -> 나중에 추가 및 npm install 필요 - 수정
        // axios 통신 만듦 - 현재는 사용 안함 - 수정 필요
        // axios({
        //     url: '/user/12345',
        //     method: 'post',
        //     params: {
        //       address: req.params.addressId
        //     }
        // })

        // 이건 나중에 민혁이에게서 받아오는 데이터를 전송할 것임 - 수정
        res.status(200).json(req.body)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// < 주소 전달 > 크롤링 서버 -> 백 -> 프론트
router.post('/address/search/result/:addressId', async (req, res, next) => {
    // 이건 어떻게 수정해야할까? 람다 서버 전용인데... -> 수정 필요
    try {
        res.status(200).json(req.body)
    } catch (err) {
        res.status(500).json({
            error : err
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

    if(ytbCrawling != null) {
        res.status(200).json({ video : videos })
    }

    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $pull : { video : { _id : req.body.video[0]._id } } }).exec()

    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $push : { video : videos } }).exec()
});

// router.post("/save/video/:channelId", async (req, res, next) => {
//     try {
//         let result = await YtbCrawlingTb.find({ ytbChannel: req.params.channelId });
//         req.body.video.forEach((body) => {
//             for (var i = 0; i < result[0].video.length; i++) {            
//                 if (result[0].video[i]._id == body._id) {
//                     console.log("result : " + result[0].video[i]._id)
//                     console.log("body : " + body._id)
//                     console.log(body.storeInfo.location.lng)

//                     result[0].video[i].status = body.status;
//                     // result[0].video[i].storeInfo.storeName = body.storeInfo.storeName;
//                     // result[0].video[i].storeInfo.storeAddress = body.storeInfo.storeAddress;
//                     // result[0].video[i].storeInfo.location.lat = body.storeInfo.location.lat;
//                     // result[0].video[i].storeInfo.location.lng = body.storeInfo.location.lng;
//                     // break;
//                 }
//             }
//       });
//       await result.save();
  
//       res.status(200).json({
//         result
//       });
//     } catch (err) {
//       res.status(500).json({
//         err
//       });
//     }
// });

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
            error: err
        });
    });
});

// router.get('/:userId', (req, res, next) => {
//     AttractionCrawlingTb.findOne({userId : req.params.userId})
//     // .select('name price _id')
//     .exec()
//     .then(doc => {
//         console.log("From database", doc);
//         if (doc) {
//             res.status(200).json({
//                 userTb: doc,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/attractionCrawlingTb'
//                 }
//             });
//         } else {
//             res.status(404)
//             .json({
//                 message: "No valid entry found for userId"
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//     });
// });

// router.patch('/:userId', (req, res, next) => {
//     const updateOps = {};
//     for(const ops of req.body) {
//         updateOps[ops.propName] = ops.value
//     }
//     AttractionCrawlingTb.update({userId : req.params.userId}, { $set: updateOps })
//     .exec()
//     .then(result => {
//         res.status(201).json({
//             message: 'AttractionCrawlingTb updated',
//             request: {
//                 type: 'GET',
//                 url: 'http://localhost:3000/attractionCrawlingTb' + userId
//             }
//         });
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// router.delete('/:userId', (req, res, next) => {
//     AttractionCrawlingTb.remove({userId : req.params.userId})
//     // const id = req.params.productId;
//     // UserTb.remove({_id: id})
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             message: 'AttractionCrawlingTb deleted',
//             request: {
//                 type: 'POST',
//                 url: 'http://localhost:3000/attractionCrawlingTb/',
//                 // body: { name: 'String', price: 'Number' }
//             }
//         })
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

module.exports = router;