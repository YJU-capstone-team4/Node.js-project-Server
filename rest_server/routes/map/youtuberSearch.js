const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const YtbChannelTb = require("../../models/ytbChannelTb.model");
const ytbStoreTb = require("../../models/ytbStoreTb.model");

// 유튜버 채널명으로 검색 결과
router.get('/youtuberSearch/:youtuber', (req, res, next) => {
    YtbChannelTb.find({"ytbChannel" : {$regex:req.params.youtuber}})
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

// 검색한 유튜버가 방문한 맛집
router.get('/map/youtuberSearch/youtuber/:Id', (req, res, next) => {
    YtbChannelTb.find({'_id' : req.params.Id})
    .populate({ path: 'video.ytbStoreTbId', select : 'storeInfo.location storeInfo.storeName'})
    .select('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            docs
        }); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

});


module.exports = router;