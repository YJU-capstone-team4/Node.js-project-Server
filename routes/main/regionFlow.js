const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ShareFlowTb = require("../../models/shareFlowTb.model")

router.get('/regionFlow', (req, res, next) => {
    ShareFlowTb.find()
    .populate('userTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            shareFlowTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    shareTitle: doc.shareTitle,
                    //shareThumbnail: `https://test-gurume.s3.ap-northeast-2.amazonaws.com/`+ doc.shareThumbnail,
                    shareThumbnail: doc.shareThumbnail,
                    adminTag: doc.adminTag,
                    userTags: doc.userTags,
                    folderId: doc.folderId
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

// shareFlowTb에서 지역으로 검색
router.get('/regionFlow/region/:regionTag', (req, res, next) => {
    ShareFlowTb.find({"adminTag.regionTag" : req.params.regionTag})
    .sort({'likeCount': -1})
    .limit(5)
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            shareFlowTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    shareTitle: doc.shareTitle,
                    shareThumbnail: doc.shareThumbnail,
                    adminTag: doc.adminTag,
                    userTags: doc.userTags,
                    folderId: doc.folderId
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