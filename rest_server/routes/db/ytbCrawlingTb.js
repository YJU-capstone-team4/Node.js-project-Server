const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbCrawlingTb = require('../../models/ytbCrawlingTb.model');
const YtbChannelTb = require('../../models/ytbChannelTb.model');
const YtbStoreTb = require('../../models/ytbStoreTb.model');
const algo = require("./algo")

// 데이터 수집 페이지 메인
router.get('/socket', async (req, res, next) => {
    try {
        var normalCount = 0;
        var errCount = 0;
        var completeCount = 0;

        // 크롤링 대기 데이터 목록
        var normalCrawling = await YtbCrawlingTb.find()

        var errCrawling = await YtbCrawlingTb.aggregate([
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

        // status가 완료인 유튜버들 및 영상들
        var completeCrawling = await YtbCrawlingTb.aggregate([
            {
              "$set": {
                "video": {
                  "$filter": {
                    "input": "$video",
                    "as": "v",
                    "cond": {"$eq": ["$$v.status","완료"]}
                  }
                }
              }
            }
        ])

        // status가 ''인 video 갯수 세기
        for (var i = 0; i < normalCrawling.length; i++)
            normalCount += normalCrawling[i].video.length

        // status가 에러인 video 갯수 세기
        for (var i = 0; i < errCrawling.length; i++)
            errCount += errCrawling[i].video.length
        
        // status가 완료인 video 갯수 세기
        for (var i = 0; i < completeCrawling.length; i++)
            completeCount += completeCrawling[i].video.length

        res.status(200).json([
            {
                status : 'normalCrawling',
                data : normalCrawling
            },
            {
                status : 'errCrawling',
                data : errCrawling,
            },
            {
                status : 'completeCrawling',
                data : completeCrawling
            }
        ])
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 에러 해결 메인 페이지 - 좌측
router.get('/error', async (req, res, next) => {
    try {
        var errCount = 0;

        // 에러가 발생한 자료들
        var errCrawling = await YtbCrawlingTb.aggregate([
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

        // status가 에러인 video 갯수 세기
        for (var i = 0; i < errCrawling.length; i++)
            errCount += errCrawling[i].video.length

        res.status(200).json({
            errTotal: errCount,
            errCrawling
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 에러 해결 메인 페이지 - 우측
router.get('/error/:channelId', async (req, res, next) => {
    try {
        var more = await YtbCrawlingTb.findOne({
            "ytbChannel": req.params.channelId
        },{
            "_id": 0,
            "video": {
                "$elemMatch": {
                    "status": '에러'
                }
            }
        })

        res.status(200).json(more)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// // 삭제 버튼 클릭 시 배열 안 해당 영상 삭제
// router.delete('/video/delete/:channelId/:videoId', (req, res, next) => {
//     YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, 
//     { $pull: { 'video' : { '_id' : req.params.videoId } } })
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             result
//         })
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
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

    // var ytbCrawlingTb = YtbCrawlingTb.find({ 'ytbChannel': req.params.channelId })
    // console.log(ytbCrawlingTb)
});

// < 주소 전달 > 프론트 -> 백 -> 크롤링 서버
router.put('/address/search/:addressId', async (req, res, next) => {
    try {
        console.log(req.params.addressId)

        res.status(200).json({
            data : req.params.addressId
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// < 주소 전달 > 크롤링 서버 -> 백 -> 프론트
router.put('/address/search/result/:addressId', async (req, res, next) => {
    try {
        res.status(200).json(req.body)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

router.post('/save/video/:channelId', (req, res, next) => {
    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $pull: { 'video': { '_id' : req.body.video[0]._id } } }
    )
    .exec()
    .then().catch(err => {
        res.status(500).json({
            error: err
        });
    });

    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $push : req.body }
    )
    .exec()
    .then(result => {
        res.status(200).json('success to save')
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
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
router.put('/save/youtuber/:channelId', async (req, res, next) => {

    // ytbCrawlingTb에서 저장 클릭 시 데이터 변수에 저장
    const ytbCrawling = await YtbCrawlingTb.findOne({ 'ytbChannel' : req.params.channelId });
    
    // 변수에 담은 뒤 신청 유튜버에서 삭제
    // await YtbCrawlingTb.remove({ 'ytbChannel' : req.params.channelId });

    var crawVideo = await YtbCrawlingTb.findOne({
        "ytbChannel": req.params.channelId
    },{
        "_id": 0,
        "video": 1
    })

    console.log(crawVideo.video[0].storeInfo.storeName)
    // console.log(crawVideo.video[1].storeInfo.storeName)

    // var ytbStore = await YtbStoreTb.findOne({
    //     "storeInfo.storeName": req.params.storeInfo.storeName
    // },{
    //     "_id": 0,
    //     "video": 1
    // })

    for(let i = 0; i < crawVideo.video.length; i++) {
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
    }

    // ytbChannelTb에 입력
    // var ytbStoreTb = new YtbStoreTb({
    //     _id: new mongoose.Types.ObjectId(),
    //     StoreInfo: {
    //         storeName: crawVideo.video.StoreInfo.storeName,
    //         storeAddress: dd,
    //         location: {
    //             lat: dd,
    //             lng: dd
    //         },
    //         typeStore: dd
    //     },
    //     regionTag: dd,

    //     ytbRank: ytbReq.ytbRank,
    //     ytbRankIncrease: ytbReq.ytbRankIncrease,
    //     likeCount: ytbReq.likeCount
    // });
    // ytbStoreTb.save()

    res.status(200).json(crawVideo);

    // // ytbChannelTb에 입력
    // const ytbChannelTb = new YtbChannelTb({
    //     _id: new mongoose.Types.ObjectId(),
    //     ytbChannel: ytbReq.ytbChannel,
    //     ytbProfile: ytbReq.ytbProfile,
    //     ytbLinkAddress: ytbReq.ytbLinkAddress,
    //     ytbSubscribe: ytbReq.ytbSubscribe,
    //     ytbSubIncrease: 0,
    //     ytbHits: ytbReq.ytbHits,
    //     ytbRank: ytbReq.ytbRank,
    //     ytbRankIncrease: ytbReq.ytbRankIncrease,
    //     likeCount: ytbReq.likeCount,
    //     video: []
    // });
    // ytbChannelTb.save()

    // // ytbCrawling으로 이동
    // const ytbCrawlingTb = new YtbCrawlingTb({
    //     _id: new mongoose.Types.ObjectId(),
    //     ytbChannel: ytbReq.ytbChannel,
    //     ytbProfile: ytbReq.ytbProfile,
    //     videoCount: ytbReq.videoCount,
    //     video: []
    // });
    // ytbCrawlingTb.save()
    // .then(result => {
    //     res.status(201).json({
    //         // message1: 'ytbReqTb -> ytbChannelTb stored',
    //         // message2: 'ytbReqTb -> ytbCrawlingTb stored',
    //         // status: 'Success',
    //         ytbChannel: ytbReq.ytbChannel,
    //         videoCount: ytbReq.videoCount
    //     });
    // })
    // .catch(err => {
    //     console.log(err);
    //     res.status(500).json({
    //         error: err
    //     });
    // });
});

// 크롤링 데이터 생성용
router.post('/', (req, res, next) => {
    const ytbCrawlingTb = new YtbCrawlingTb({
      _id: new mongoose.Types.ObjectId(),
      ytbChannel: req.body.ytbChannel,
      ytbProfile: req.body.ytbProfile,
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
                video: result.video,
                videoCount: result.videoCount,
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