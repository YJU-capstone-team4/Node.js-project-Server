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


        // process.exit(0)
        //shareFlowTb에 들어갈 내용 저장
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
        .catch(err => {
            res.status(500).json("동선 공유를 실패했습니다.");
        });
        // console.log("공유 동선 저장 완료")


        // 해시 태그 저장
        req.body.userTags.forEach(async element =>  {
            const tag = await UserTagTb.findOne({'userTag.userTag': element})
            .exec()
            console.log(tag)
                console.log("해시태그 저장 시작")
                if(!tag) {
                    const userTag = await UserTagTb.findOne()
                    .exec()
                    let newTag = {                     
                            userTag: element,
                            useCount: 1
                    }
                    userTag.userTag.push(newTag)
                    await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, userTag)
                    .exec()
                    .catch(err => {
                        res.status(500).json("해시태그 저장을 실패하였습니다.");
                    });
                }else {
                    tag.userTag.forEach(userTag => {
                        if(userTag.userTag == element) {
                            userTag.useCount++;
                        }
                    })
                    await UserTagTb.findOneAndUpdate({'userTags.userTag' : element}, tag)
                    .exec()
                    .catch(err => {
                        res.status(500).json("해시태그 저장을 실패하였습니다.");
                    });
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
                await UserTagTb.findOne({'userTag.userTag': element})
                .exec()
                .then(docs => {
                    if(!docs) {
                        let tmp = new UserTagTb({
                            _id: new mongoose.Types.ObjectId(),
                            userTag: element,
                            userCount: 1
                        })

                        //UserTagTb(tmp).save().exec()
                    }else {
                        UserTagTb.findOneAndUpdate({'userTag' : element}, {$inc :{'userCount': 1}})
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
        mongoose.set('useFindAndModify', false);
        const shareFlow = await ShareFlowTb.findOne({_id: req.body.shareFlowId}).exec()
        // 해시태그 삭제

        console.log(shareFlow)
        // 
        
        const tag = await UserTagTb.findOne({_id : '5fb7a29bf648764c3cb9ebeb'}).exec()
        // .then(doc => {
        //     res.status(200).json(doc)
        // });
        console.log(tag)
        tag.userTag.forEach(userTag => {
            if(shareFlow.userTags.includes(userTag.userTag)) {
                userTag.useCount--;
                if(userTag.useCount == 0) {
                    userTag = null
                }
            }
        })
        await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, userTag)
        .exec()
        .catch(err => {
            res.status(500).json("해시태그 저장을 실패하였습니다.");
        });
        // UserTagTb.updateOne(userTag);
    
    

        // 공유 동선 삭제
        // await ShareFlowTb.findByIdAndRemove(req.body.shareFlowId)
        // .exec() 
        // .then(doc => {
        //     res.status(200).json("success")
        // })
        // .catch(err => {
        //     res.status(500).json("동선 삭제를 실패하였습니다.");
        // });
    
    } catch(e) {
        res.status(500).json({
            error: e
        });

    }

})

// 동선 좋아요 추가
router.post('/shareFlow/like', async (req, res, next) => {
    try{
        mongoose.set('useFindAndModify', false);
        // 동선 좋아요 확인
        req.body.userId = 'payment'
        let flowLike = false;
        if(req.body.userId) { // 로그인이 되어 있을 때 
            const user = await UserTb.findOne({userId: req.body.userId})
            .select('likeFlows')
            .exec();

            if(user.likeFlows.includes(req.body.shareFlow_id)) {
                flowLike = true;
            }
            
        }



        const user = await UserTb.findOne({"userId":req.body.userId})
        .exec();
        const shareFlow = await ShareFlowTb.find({"_id": req.body.shareFlow_id})
        .exec()
        console.log(flowLike)
        // likeFlows 에 좋아요 누른 공유 동선 추가
        if(flowLike) {//like가 되어 있는 상태라면 삭제
            // likeFlows 에 좋아요 누른 공유 동선 추가
            let tmp = 0;
            let index = 0;
            user.likeFlows.forEach(element => {
                if(element == req.body.shareFlow_id)
                    index = tmp; 
                tmp++;
            })

            user.likeFlows.splice(index, 1)

            // likeCount 값 감소
            shareFlow.likeCount--;
            
        }else {//like가 되어 있지 않다면 추가
            // 동선에서 삭제
            user.likeFlows.push(req.body.shareFlow_id)
        
            // likeCount  에 값 증가
            shareFlow.likeCount++;
            
        }

        await UserTb.findOneAndUpdate({"userId": req.body.userId}, user)
        .exec();

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