const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model");
const YtbStoreTb = require("../../models/ytbStoreTb.model");
const AdminTagTb = require('../../models/adminTagTb.model');
const UserTb = require('../../models/userTb.model');
// 유튜버 상세 페이지 - 유튜버 정보
router.get('/youtuber/:ytb_id', async (req, res, next) => {
    req.body.userId = 'payment'
    let youtuberLike = false;
    if(req.body.userId) { // 로그인이 되어 있을 때 
        const user = await UserTb.findOne({userId: req.body.userId})
        .select('likeYoutuber')
        .exec();

        if(user.likeYoutuber.includes(req.params.ytb_id)) {
            youtuberLike = true;
        }
        
    }

    YtbChannelTb.findOne({_id : req.params.ytb_id})
    .populate('video.ytbStoreTbId')
    .exec()
    .then(async docs => {
        let Increase = docs.ytbRankIncrease - docs.ytbRank
        
        // 인기 급상승
        let ytbIncrease = []
        const youtuber = await YtbChannelTb.find()
        .sort(ytbRankIncrease-ytbRank)
        .exec();
        

        res.status(200).json({
            ytbChannel : docs.ytbChannel,
            ytbProfile: docs.ytbProfile,
            ytbSubscribe: docs.ytbSubscribe,
            rank: docs.ytbRankIncrease,
            ytbRankIncrease: Increase,
            youtuberLike : youtuberLike
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 유튜브 영상 정보 가져오기 - 조회수 순으로 
router.get('/youtuber/video/:ytb_id', (req, res, next) => {
    YtbChannelTb.findOne({_id : req.params.ytb_id})
    .select('video.hits')
    .select('video.ytbAddress')
    .select('video.ytbVideoName')
    .select('video.ytbThumbnail')
    .exec()
    .then(docs => {

        const video = docs.video.sort((a, b) =>{
            return b.hits - a.hits;
        }).splice(0, 5)

        res.status(200).json({
            video: video
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 유튜버가 지역별로 방문한 맛집 영상
router.get('/youtuber/region/:ytb_id', async (req, res, next) => {
    try {
        const youtuber = await YtbChannelTb.findOne({_id : req.params.ytb_id})
        .select('video.ytbStoreTbId')
        .exec()

        let search = []
        youtuber.video.forEach(element => {
            search.push(element.ytbStoreTbId)
        });

        await YtbStoreTb.find({_id: {$in: search}})
        .select('regionTag')
        .distinct('regionTag')
        .exec()
        .then(regionTag => {
            res.status(200).json(regionTag)

        })

    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버가 지역별로 방문한 맛집 영상
router.post('/youtuber/localVideo', async (req, res, next) => {
    try {
        const youtuber = await YtbChannelTb.findOne({_id : req.body.ytb_id})
        .select('video.storeId')
        .select('video._id')
        .select('video.ytbVideoName')
        .select('video.ytbAddress')
        .select('video.hits')
        .exec()

        let search = []
        youtuber.video.forEach(element => {
            search.push(element.storeId)
        });

        let store = await YtbStoreTb.find({_id: {$in: search}})
        .where('regionTag')
        .in(req.body.regionTags)
        .select('_id')
        .select('regionTag')
        .exec()

        const ids = []
        store.forEach(element => {
            ids.push(element._id)
        })

        let result = []

        ids.forEach(element =>  {
            youtuber.video.forEach(id => {
                if(element == id.storeId) {
                    result.push(id)
                }
            })
        })

         return res.status(200).json(result)

    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버 좋아요
router.post('/youtuber/like', async (req, res, next) => {
    try {
        mongoose.set('useFindAndModify', false);
        req.body.userId = 'payment'
        let youtuberLike = false;
        if(req.body.userId) { // 로그인이 되어 있을 때 
            const user = await UserTb.findOne({userId: req.body.userId})
            .select('likeYoutuber')
            .exec();
            console.log(user)
            if(user.likeYoutuber.includes(req.body.ytb_id)) {
                youtuberLike = true;
            }
            
        }
        console.log(youtuberLike)
        // 추가할 사람 검색
        const user = await UserTb
        .findOne({
            "userId": req.body.userId
        })
        .exec()
        if(youtuberLike) {// 유튜버 삭제하기
            let i = 0
            tmp = 0
            user.likeYoutuber.forEach(element => {
                if(element == req.body.ytb_id) {
                    i = tmp;
                }
                tmp++;
            });

            user.likeYoutuber.splice(i,1)
 
        } else { // 유튜버 추가하기
            user.likeYoutuber.push(req.body.ytb_id);
        }
        // 좋아요 업데이트
        await UserTb
        .findOneAndUpdate({
            "userId": req.body.userId
        }, user)
        .exec()
        .then(doc => {
            res.status(201).json("success")
        })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버 신청
router.post('/youtuber/request', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .select('_id')
            .select('userId')
            .exec()
        mongoose.set('useFindAndModify', false);


        // 크롤링 함수 불러오기


        //  새로운 신청 객체 만들기
        const newYtbReq = {
            ytbChannel: req.body.ytbChannel,
            userTbId: user._id,
            userId: req.body.user_id
        };
        // 신청 db에 추가

    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});



module.exports = router;