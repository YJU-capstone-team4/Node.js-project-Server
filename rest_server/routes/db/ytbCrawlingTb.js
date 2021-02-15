const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbCrawlingTb = require('../../models/ytbCrawlingTb.model');
const algo = require("./algo")

router.get('/', async (req, res, next) => {
    try {
        var normalCount = 0;
        var errCount = 0;
        var completeCount = 0;

        // 크롤링 대기 데이터 목록
        var normalCrawling = await YtbCrawlingTb.aggregate([
            {
              "$set": {
                "video": {
                  "$filter": {
                    "input": "$video",
                    "as": "v",
                    "cond": {"$eq": ["$$v.status",""]}
                  }
                }
              }
            }
        ])

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

        res.status(200).json({
            normalTotal: normalCount,
            errTotal: errCount,
            completeTotal: completeCount,
            normalCrawling,
            errCrawling,
            completeCrawling
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

router.get('/error/:channelId', async (req, res, next) => {
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

        // status가 에러인 video 갯수 세기
        for (var i = 0; i < errCrawling.length; i++)
            errCount += errCrawling[i].video.length

        res.status(200).json({
            errTotal: errCount,
            left: errCrawling,
            right: more
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

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