const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbStoreTb = require("../../models/ytbStoreTb.model")

router.get('/', (req, res, next) => {
    YtbStoreTb.find()
    .all([{"storeInfo.location.lat" : req.params.location.lat,
            "storeInfo.location.lng": req.params.location.lng}])
    .select()
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbStoreTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    location: doc.storeInfo.location,
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