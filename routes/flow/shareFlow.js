const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTb = require('../../models/userTb.model');
const UserTagTb = require('../../models/userTagTb.model');
const { route } = require('../db/userTb');

function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}

//  동선 제목, 썸네일 저장 후 성공 여부 반환
router.post('/shareFlow/folder', async (req, res, next) => {
    try {
        req.body.user_id = 'payment';
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
            shareDate: getCurrentDate(new Date()),
            updateDate: null,
            likeCount: 0,
            hits: 0,
        });
        await ShareFlowTb(shareFlowTb).save()
        .exec()
        console.log("공유 동선 저장 완료")


        // 해시 태그 저장
        const tag = await UserTagTb.find()
        .exec()

        req.body.userTags.forEach(async element =>  {

            let tmp = tag.userTags.includes(element)

                console.log("해시태그 저장 시작")
                if(!tmp) {
                    let newTag = new UserTagTb({
                            _id: new mongoose.Types.ObjectId(),                      
                            userTag: element,
                            userCount: 1
                    })
                    tag.userTags.push(newTag)
                    await UserTagTb.findByIdAndUpdate(tag._id, tag)
                }else {
                    //await UserTagTb.updateOne({'userTags.userTag' : element}, {$inc :{'userCount': 1}})
                }

                return res.status(201).json("success")
            })
    }
    catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 공유 동선 수정
router.put('/shareFlow/folder', async (req, res, next) => {
    try{
        // 공유 동선 폴더 수정
        const shareFlow = await ShareFlowTb.findOne({ _id : req.body.shareFlowId })
        .exec()

        
        // 해시태그 수정
        let newTag = [];
        let disappearTag = [];
        // 새로 추가된 해시태그 검색
        req.body.userTags.forEach(async element => {
            let tmp = await shareFlow.userTags.includes(element)

            if(!tmp) {
                await UserTagTb.findOne({'userTag': element})
                .exec()
                .then(doc => {
                    if(!doc) {
                        let tmp = new UserTagTb({
                            _id: new mongoose.Types.ObjectId(),
                            userTag: element,
                            userCount: 1
                        })
                        UserTagTb(tmp).save().exec()
                    }else {
                        UserTagTb.updateOne({'userTag' : element}, {$inc :{'userCount': 1}})
                    }
                })
            }
        })
        // 없어진 해시태그 검색
        shareFlow.userTags.forEach(async element => {
            let tmp = await req.body.userTags.includes(element)

            if(!tmp) {
                UserTagTb.updateOne({'userTag' : element}, {$inc :{'userCount': -1}})
            }
        })
        shareFlow.shareTitle = req.body.shareTitle;
        shareFlow.shareThumbnail = req.body.shareThumbnail;
        shareFlow.adminTag = req.body.adminTag;
        shareFlow.userTags = req.body.userTags;

        shareFlow.updateDate = getCurrentDate(new Date())

        mongoose.set('useFindAndModify', false);
        await ShareFlowTb.findOneAndUpdate({ _id : req.body.shareFlowId }, shareFlow)
        .exec()
        .then(doc => {
            res.status(201).json("success")
        });

        // 해시태그 수정
        
    } catch(e) {
        res.status(500).json({
            error: e
        });

    }

})

// 공유 동선 삭제
router.delete('/shareFlow/folder', async(req, res, next) => {
    try {
        const shareFlow = await ShareFlowTb.findOne({_id: req.body.shareFlowId}).exec()
        // 해시태그 삭제
        // 
        const userTag = await UserTagTb.find().exec();
        userTag.forEach(userTag => {
            shareFlow.userTags.forEach(tmp => {
                if(tmp == userTag) {
                    UserTagTb.updateOne({'userTag' : element}, {$inc :{'userCount': -1}})
                }
            })
                
        })
        // UserTagTb.updateOne(userTag);
    
    
        mongoose.set('useFindAndModify', false);
        // 공유 동선 삭제
        await ShareFlowTb.findByIdAndRemove(req.body.shareFlowId)
        .exec() 
        .then(doc => {
            res.status(200).json("success")
        })
    
    } catch(e) {
        res.status(500).json({
            error: e
        });

    }

})

// 동선 좋아요 추가

router.post('/shareFlow/like', async (req, res, next) => {
    try{
        req.body.user_id = 'payment'
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
        req.body.user_id = 'payment'
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