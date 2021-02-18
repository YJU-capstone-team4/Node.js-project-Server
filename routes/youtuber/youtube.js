const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model");
const YtbStoreTb = require("../../models/ytbStoreTb.model");
const AdminTagTb = require('../../models/adminTagTb.model');
const UserTb = require('../../models/userTb.model');
// 유튜버 상세 페이지 - 유튜버 정보
router.get('/youtuber/:ytb_id', (req, res, next) => {
    YtbChannelTb.findOne({_id : req.params.ytb_id})
    .populate('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            ytbChannel : docs.ytbChannel,
            ytbProfile: docs.ytbProfile,
            ytbSubscribe: docs.ytbSubscribe,
            rank: docs.ytbRank
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

// 좋아요 클릭한 유튜버 userTb에 저장
router.post('/youtuber/like', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            user.likeYoutuber.push(req.body.ytb_id);
            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
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


// 유튜버 좋아요 삭제
router.delete('/youtuber/like', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()


            let i = 0
            tmp = 0
            user.likeYoutuber.forEach(element => {
                if(element == req.body.ytb_id) {
                    i = tmp;
                }
                tmp++;
            });

            user.likeYoutuber.splice(i,1)

            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
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

module.exports = router;