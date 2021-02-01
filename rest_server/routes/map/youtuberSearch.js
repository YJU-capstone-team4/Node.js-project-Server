const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model")

// 유튜버 채널명으로 검색 결과
router.get('/map/youtuberSearch/:youtuber', (req, res, next) => {
    YtbChannelTb.find({ytbChannel : req.params.youtuber})
    .populate('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        console.log("From database", docs);
        if (docs) {
            res.status(200).json({
                YtbChannelTb: docs.map(doc => {
                    return {
                        _id: doc._id,
                        ytbChannel: doc.ytbChannel,
                        ytbProfile: doc.ytbProfile,
                        ytbSubscribe: doc.ytbSubscribe,
                        video: doc.video.length,
                    }
                })
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for object Id"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});

// 유튜버가 방문한 맛집들의 location
router.get('/map/youtuberSearch/youtuber/:youtuberId', (req, res, next) => {
    YtbChannelTb.find({_id : req.params.youtuberId})
    .populate('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        console.log("From database", docs);
        if (docs) {
            res.status(200).json({
                YtbChannelTb:docs.map(doc => {
                    return {
                        _id: doc._id,
                        video: doc.video.ytbStoreTbId,
                    }
                })
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for object Id"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});

// 유튜버 클릭 시 해당 유튜버 영상들 반환
router.get('/show/:channerId', (req, res, next) => {
    YtbChannelTb.find({ytbChannel : req.params.channerId})
    .populate('video.ytbStoreTbId')
    .select('video')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                userTb: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/ytbChannelTb/show/' + req.params.channerId
                }
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for object Id"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});


module.exports = router;