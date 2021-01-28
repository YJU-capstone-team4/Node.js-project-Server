const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model")

router.get('/', (req, res, next) => {
    YtbChannelTb.find()
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
                    ytbProfile: doc.ytbProfile,
                    ytbLinkAddress: doc.ytbLinkAddress,
                    ytbSubscribe: doc.ytbSubscribe,
                    ytbHits: doc.ytbHits,
                    video: doc.video,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/ytbChannelTb/' + doc._id
                    }
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

router.get('/:channerId', (req, res, next) => {
    YtbChannelTb.find({ytbChannel : req.params.channerId})
    // .populate({
    //     path: 'ytbStoreTbId',
    //     match: {
    //         regionTag: req.params.channelId
    //     }
    // })
    .populate('video.ytbStoreTbId')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                userTb: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/ytbChannelTb'
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

router.post('/', (req, res, next) => {
      const ytbChannelTb = new YtbChannelTb({
        _id: new mongoose.Types.ObjectId(),
        ytbChannel: req.body.ytbChannel,
        ytbProfile: req.body.ytbProfile,
        ytbLinkAddress: req.body.ytbLinkAddress,
        ytbSubscribe: req.body.ytbSubscribe,
        ytbHits: req.body.ytbHits,
        video: req.body.video,
      });
      ytbChannelTb.save()
      .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'ytbChannelTb stored',
            createdYtbChannelTb: {
                _id: result._id,
                ytbChannel: result.ytbChannel,
                ytbProfile: result.ytbProfile,
                ytbLinkAddress: result.ytbLinkAddress,
                ytbSubscribe: result.ytbSubscribe,
                ytbHits: result.ytbHits,
                video: result.video,
            },
            request: {
                type: 'POST',
                url: 'http://localhost:3000/ytbChannelTb/' + result._id
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

module.exports = router;