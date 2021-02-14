const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTb = require('../../models/userTb.model');
const { route } = require('../db/userTb');

//  동선 제목, 썸네일 저장 후 성공 여부 반환

router.post('/shareFlow/folder', async (req, res, next) => {
    try {
        // 로그인 검사 후 필요한 유저정보 반환
        const userInfo = await UserTb.findOne({userId : req.body.user_id})
        .exec()


        //process.exit(0)
        // shareFlowTb에 들어갈 내용 저장
        const shareFlowTb = new ShareFlowTb({
            _id: new mongoose.Types.ObjectId(),
            userTbId: userInfo._id,
            userId: req.body.user_id,
            shareTitle: req.body.shareTitle,
            shareThumbnail: req.body.shareThumbnail,
            folderId: req.body.folderId,
            adminTag: req.body.adminTag,
            userTags: req.body.userTags,
            shareDate: new Date(),
            updateDate: null,
            likeCount: 0,
            hits: 0,
        });
        ShareFlowTb(shareFlowTb).save()
        .then(result => {
        console.log(result);
        res.status(201).json({
            result

        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 공유 동선 수정
router.put('/shareFlow/folder', (req, res, next) => {
    mongoose.set('useFindAndModify', false);
    ShareFlowTb.findByIdAndRemove(req.body.shareFlowId)
    .exec()
    .then(doc => {
        res.status(200).json({
            doc
        })
    })
})

// 공유 동선 삭제
router.delete('/shareFlow/folder', (req, res, next) => {
    mongoose.set('useFindAndModify', false);
    ShareFlowTb.findByIdAndRemove(req.body.shareFlowId)
    .exec()
    .then(doc => {
        res.status(200).json({
            doc
        })
    })
})
module.exports = router;