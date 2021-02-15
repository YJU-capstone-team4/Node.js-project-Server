const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTb = require('../../models/userTb.model');
const UserTagTb = require('../../models/userTagTb.model');
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
        // ShareFlowTb(shareFlowTb).save()
        // .exec()
        // 해시 태그 저장
        req.body.userTags.forEach(element => {
            UserTagTb({userTag: element, userCount: 1}).save().exec()
            .then(doc => {
                res.status(201).json("success");
            });
        })
    }
    catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 공유 동선 수정
router.put('/shareFlow/folder', (req, res, next) => {
    mongoose.set('useFindAndModify', false);
    ShareFlowTb.findByIdAndUpdate(req.body.shareFlowId)
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
    // ShareFlowTb.findOneAndRemove({'shareTitle':req.body.shareTitle})
    // .exec()
    // .then(doc => {
    //     res.status(200)
    // })
})

// 동선 좋아요 추가

router.post('/shareFlow/like', async (req, res, next) => {
    try{
        mongoose.set('useFindAndModify', false);

        // likeFlows 에 좋아요 누른 공유 동선 삭제
        const user = await UserTb.findOne({"userId":req.body.user_id})
        .exec();
        user.likeFlows.push(req.body.shareFlow_id)
        console.log(user.likeFlows)

        UserTb.findOneAndUpdate({"userId": req.body.user_id}, user)
        .exec();

    
        // likeCount  에 값 증가
        const shareFlow = await ShareFlowTb.find({"_id": req.body.shareFlow_id})
        .exec()
        shareFlow.likeCount++;
        console.log(shareFlow.likeCount)
        await ShareFlowTb.findOneAndUpdate({"_id": req.body.shareFlow_id}, shareFlow)
        .exec()
        .then(doc => {
            res.status(201).json("success")
        })
        
    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
})


// 동선 좋아요 삭제하기
router.delete('/shareFlow/like', async (req, res, next) => {
    try{
        mongoose.set('useFindAndModify', false);

        // likeFlows 에 좋아요 누른 공유 동선 추가
        const user = await UserTb.findOne({"userId":req.body.user_id})
        .exec();
        let tmp = 0;
        let index = 0;
        user.likeFlows.forEach(element => {
            if(element == req.body.shareFlow_id)
                index = tmp; 
            tmp++;
        })

        user.likeFlows.splice(index, 1)

        console.log(user.likeFlows)

        UserTb.findOneAndUpdate({"userId": req.body.user_id}, user)
        .exec();

    
        // likeCount 값 감소
        const shareFlow = await ShareFlowTb.find({"_id": req.body.shareFlow_id})
        .exec()
        shareFlow.likeCount--;
        console.log(shareFlow.likeCount)
        await ShareFlowTb.findOneAndUpdate({"_id": req.body.shareFlow_id}, shareFlow)
        .exec()
        .then(doc => {
            res.status(201).json("success")
        })
        
    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
})


module.exports = router;