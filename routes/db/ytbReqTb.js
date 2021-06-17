const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbReqTb = require("../../models/ytbReqTb.model")
const UserTb = require("../../models/userTb.model")
const YtbChannelTb = require("../../models/ytbChannelTb.model")
const YtbCrawlingTb = require("../../models/ytbCrawlingTb.model")
const { getYtbCrawling } = require('../../crawling/youtube/index')
const fetch = require('node-fetch');
const axios = require('axios');

router.get('/', (req, res, next) => {
    YtbReqTb.find()
    .select()
    .populate('userTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbReqTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    ytbChannel: doc.ytbChannel,
                    ytbProfile: doc.ytbProfile,
                    ytbLinkAddress: doc.ytbLinkAddress,
                    ytbSubscribe: doc.ytbSubscribe,
                    ytbHits: doc.ytbHits,
                    videoCount: doc.videoCount,
                    userTbId: doc.userTbId,
                    userId: doc.userId,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/ytbReqTb/' + doc.ytbChannel
                    }
                }
            })
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

// populated 내 쿼리 map 안 쓴 버전 - userId
router.get('/:userId', async (req, res, next) => {
    try {
        const docs = await UserTb.find({
            "userId": req.params.userId
          }).exec()

        // let ids = docs.map(doc => doc.id);
        let ids = ''
        docs.forEach(doc => {
            ids = doc.id;
        });

        const data = await YtbReqTb.find({
              "userTbId": {$in:ids}
          })
          .populate({
              path: 'userTbId'
          })
          .exec()

        return res.status(200).json({
            data
        }); 

    } catch(e) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// ytbReqTb 데이터 저장
router.post('/', (req, res, next) => {
    const ytbReqTb = new YtbReqTb({
        _id: new mongoose.Types.ObjectId(),
        ytbChannel: req.body.ytbChannel,
        ytbProfile: req.body.ytbProfile,
        ytbLinkAddress: req.body.ytbLinkAddress,
        ytbSubscribe: req.body.ytbSubscribe,
        ytbHits: req.body.ytbHits,
        videoCount: req.body.videoCount,
        userTbId: req.body.userTbId,
        userId: req.body.userId,
    });
    ytbReqTb.save()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Created ytbReqTb successfully',
            createdUserId: {
                _id: result._id,
                ytbChannel: result.ytbChannel,
                ytbProfile: result.ytbProfile,
                ytbLinkAddress: result.ytbLinkAddress,
                ytbSubscribe: result.ytbSubscribe,
                ytbHits: result.ytbHits,
                videoCount: result.videoCount,
                userTbId: result.userTbId,
                userId: result.userId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/ytbReqTb/' + result.userId
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

// 신청 유튜버 삭제
router.delete('/delete/:youtuber', async (req, res, next) => {    
    // 변수에 담은 뒤 신청 유튜버에서 삭제
    await YtbReqTb.remove({ 'ytbChannel' : req.params.youtuber }).exec()
    .then(result => {
        res.status(200).json('delete success')
    })
    .catch(err => {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

// 신청 유튜버 승인 시
router.put('/recognize/:youtuber', async (req, res, next) => {
    // ytbReqTb에서 승인 시 데이터 변수에 저장
    const ytbReq = await YtbReqTb.findOne({ 'ytbChannel' : req.params.youtuber });
    
    // 변수에 담은 뒤 신청 유튜버에서 삭제
    await YtbReqTb.remove({ 'ytbChannel' : req.params.youtuber });

    // 민혁이 코드 실행 : req.params.youtuber로 검색해서 크롤링
    console.log('req.params.youtuber :', req.params.youtuber)

    // 내 쪽에서 민혁이 쪽으로 데이터 전송!! - 민혁 주소 필요
    var url = 'https://bxi4xtuqwc.execute-api.ap-northeast-2.amazonaws.com/start/' + req.params.youtuber

    console.log('url : ', url)

    axios.get(url)
    .then(function(response) {
        // json 출력
        res.status(200).json('Crawling 시작');
        console.log(data);
    })
    .catch(err => {
        // error 처리
        // console.log('Fetch Error', err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });

    // fetch(url)
    // .then(res => {
    //     // response 처리
    //     // 응답을 JSON 형태로 파싱
    //     return res.json();
    // })
    // .then(data => {
    //     // json 출력
    //     res.status(200).json('Crawling 시작');
    //     console.log(data);
    // })
    // .catch(err => {
    //     // error 처리
    //     // console.log('Fetch Error', err);
    //     res.status(500).json({
    //         error: 'Internal Server Error'
    //     });
    // });
});

module.exports = router;