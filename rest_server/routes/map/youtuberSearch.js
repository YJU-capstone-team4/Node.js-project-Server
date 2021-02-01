const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const YtbChannelTb = require("../../models/ytbChannelTb.model");
const ytbStoreTb = require("../../models/ytbStoreTb.model");

// 유튜버 채널명으로 검색 결과
router.get('/map/youtuberSearch/:youtuber', (req, res, next) => {
    YtbChannelTb.find({"ytbChannel" : req.params.youtuber})
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
router.get('/map/youtuberSearch/youtuber/:Id', async (req, res, next) => {
    try {
        const docs = await YtbChannelTb.find({
            "_id": req.params.Id
          }, {
              "_id": 0
          })
          .populate('video.ytbStoreTbId')
          .exec()

          console.log(docs.video);
          docs.video.forEach(doc => {
            console.log(0)

        });

        
    //    process.exit(1)

        let ids = []
        docs.video.forEach(doc => {
            ids.push(docs.video.ytbStoreTbId);

        });
        console.log(ids);

        await ytbStoreTb.find({
              '_id': {$in:ids}
          })
          .exec()
          .then(docs => {
            res.status(200).json({
                ytbStoreTb: docs.map(doc => {
                    return {
                        _id: doc._id,
                    }
                })
            })
        }) 
    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
});

module.exports = router;