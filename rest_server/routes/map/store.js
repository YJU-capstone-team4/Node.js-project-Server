const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbStoreTb = require("../../models/ytbStoreTb.model")
const YtbChannelTb = require("../../models/ytbChannelTb.model")

router.get('/map/store/:storeId', (req, res, next) => {
    YtbStoreTb.find({"_id": req.params.storeId})
    .select()
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbStoreTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    storeName: doc.storeInfo.storeName,
                    storeAddress:doc.storeInfo.storeAddress,
                }
            })
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/storeYoutuber/:store_id', (req, res, next) => {
    YtbChannelTb.find({"video.ytbStoreTbId" : req.params.store_id})
    .select()
    .populate('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbChannelTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    ytbChannel: doc.ytbChannel,
                    video: doc.video,
                }
            })
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

    
});
module.exports = router;