const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const s3 = require('../../config/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs'); // 설치 x
const path = require('path'); // 설치 x
const AWS = require('aws-sdk');
const storage = multer.memoryStorage()

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

const upload = multer({storage: storage})
//  동선 제목, 썸네일 저장 후 성공 여부 반환
router.post('/shareFlow/folder',upload.single('img'), async (req, res, next) => {
    try {
        //if(!await ShareFlowTb.find({folderId : req.body.folderId})) {
            if(!req.body.shareTitle || !req.body.folderId || !req.body.adminTag|| !req.body.userTags || !req.file){
                res.status(200).json("입력되지 않은 값이 있습니다.")
            }
            else {
                const s3Client = s3.s3Client;
                const params = s3.uploadParams;
        
                mongoose.set('useFindAndModify', false);
                req.body.user_id = 'payment';
                // 로그인 검사 후 필요한 유저정보 반환
                const userInfo = await UserTb.findOne({userId : req.body.user_id})
                .exec()
        
        
                let payLoad = {url: req.file.location};
        
                
                //shareFlowTb에 들어갈 내용 저장
                const shareFlowTb = new ShareFlowTb({
                    _id: new mongoose.Types.ObjectId(),
                    userTbId: userInfo._id,
                    userId: req.body.user_id,
                    shareTitle: req.body.shareTitle,
        
                    folderId: req.body.folderId,
                    adminTag: JSON.parse(req.body.adminTag),
                    userTags: JSON.parse(req.body.userTags),
                    shareDate: getCurrentDate(new Date()),
                    updateDate: null,
                    likeCount: 0,
                    hits: 0,
                });
                const flowId = await ShareFlowTb(shareFlowTb).save()
                .then(doc => {
                    return doc._id;
                })
        
                params.Key = flowId.toString();
                params.Body = req.file.buffer;
                console.log(params);
                s3Client.upload(params, (err, data) => {
                    if(err) {
                        res.status(500).json("파일 업로드에 실패했습니다.");
                    }
                 })
                console.log("파일 업로드 성공")
        
                const shareFlowImg = await ShareFlowTb.findOne({_id : flowId})
                .exec()
        
                shareFlowImg.shareThumbnail = flowId.toString()
                console.log(shareFlowImg)
        
                await ShareFlowTb.findOneAndUpdate({_id : flowId},shareFlowImg)
                .catch(err => {
                    res.status(500).json("동선 공유를 실패했습니다.");
                });
                console.log("공유 동선 저장 완료")
        
        
                // 해시 태그 저장
                req.body.userTags.forEach(async element =>  {
                    const tag = await UserTagTb.findOne({'userTag.userTag': element})
                    .exec()
                    console.log(tag)
                    console.log("해시태그 저장 시작")
                    if(!tag) { // 아예 새로운 태그인 경우
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
                    }else { // 원래 있던 태그인 경우
                        tag.userTag.forEach(userTag => {
                            if(userTag.userTag == element) {
                                userTag.useCount++;
                            }
                        })
                        await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, tag)
                        .exec()
                        .catch(err => {
                            res.status(500).json("해시태그 저장을 실패하였습니다.");
                        });
                    }
                })
                return res.status(201).json("success")
             }
            // } else {
            //     return res.status(201).json("이미 공유된 동선입니다.")
            // }
        }
        

    catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 공유 동선 수정
router.put('/shareFlow/folder',upload.single('img'), async (req, res, next) => {
    try{
        if(!req.body.shareTitle || !req.body.folderId || !req.body.adminTag.regionTag || !req.body.userTags || !req.file || !req.body.adminTag.seasonTag){
            res.status(200).json("입력되지 않은 값이 있습니다.")
        }else {
            const s3Client = s3.s3Client;
            const params = s3.uploadParams;
    
            req.params.user_id = 'payment';
            // 로그인 검사 후 필요한 유저정보 반환
            const userInfo = await UserTb.findOne({userId : req.params.user_id})
            .exec()
            const shareFlow = await ShareFlowTb.findOne({_id: req.body.shareFlowId}).exec()
    
            params.Key = req.body.shareFlowId.toString();
            params.Body = req.file.buffer;
            console.log(params);
            s3Client.upload(params, (err, data) => {
                if(err) {
                    res.status(500).json("파일 업로드에 실패했습니다.");
                }
             })
            console.log("파일 업로드 성공")
    
            // 공유 동선 폴더 수정
            mongoose.set('useFindAndModify', false);
    
            // 해시태그 수정
            let newTag = [];
            let disappearTag = [];
            // 새로 추가된 해시태그 검색
            req.body.userTags.forEach(element => {
                if(!shareFlow.userTags.includes(element)) {
                    newTag.push(element)
                }
    
            })
    
            // 없어진 해시태그 검색
            shareFlow.userTags.forEach(async element => {
                if(!req.body.userTags.includes(element)) {
                    disappearTag.push(element)
                }
            })
    
            
            // 없어진 해시태그 삭제
            const tag = await UserTagTb.findOne({_id : '5fb7a29bf648764c3cb9ebeb'}).exec()
            tag.userTag.forEach(userTag => {
                if(disappearTag.includes(userTag.userTag)) {
                    userTag.useCount--;
                }
            })
            // 사용횟수가 0이면 삭제
            tag.userTag = tag.userTag.filter(doc => doc.useCount !=0)
            console.log(tag.userTag)
            
            // 원래 있던 해시태그 그대로
            await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, tag)
            .exec()
            .catch(err => {
                res.status(500).json("해시태그 수정에 실패하였습니다.");
            });
    
    
            // 새로 생긴 해시태그 추가
            newTag.forEach(async element =>  {
                const putTag = await UserTagTb.findOne({'userTag.userTag': element})
                .exec()
                if(!putTag) { // 아예 새로운 태그인 경우
                    const userTag = await UserTagTb.findOne()
                    .exec()
                    let newOne = {                     
                            userTag: element,
                            useCount: 1
                    }
                    userTag.userTag.push(newOne)
                    await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, userTag)
                    .exec()
                    .catch(err => {
                        res.status(500).json("해시태그 저장을 실패하였습니다.");
                    });
    
                }else { // 원래 있던 태그인 경우
                    putTag.userTag.forEach(userTag => {
                        if(userTag.userTag == element) {
                            userTag.useCount++;
                        }
                    })
                    await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, putTag)
                    .exec()
                    .catch(err => {
                        res.status(500).json("해시태그 저장을 실패하였습니다.");
                    });
                }
            })
    
            // 동선에 수정할 값 입력
            shareFlow.shareTitle = req.body.shareTitle;
            shareFlow.adminTag = JSON.parse(req.body.adminTag);
            shareFlow.userTags = JSON.parse(req.body.userTags);
            shareFlow.updateDate = getCurrentDate(new Date())
    
            await ShareFlowTb.findOneAndUpdate({ _id : req.body.shareFlowId }, shareFlow)
            .exec()
            .then(doc => {
                res.status(201).json("success")
            })
    
        }

    } catch(e) {
        res.status(500).json({
            error: e
       });

   }

})

// 공유 동선 삭제
router.delete('/shareFlow/folder', async(req, res, next) => {
    try {
        const s3Client = s3.s3Client;
        mongoose.set('useFindAndModify', false);
        const shareFlow = await ShareFlowTb.findOne({_id: req.body.shareFlowId}).exec()
        
        // s3에 저장되어 있는 이미 삭제
        s3Client.deleteObject({
            Bucket: 'test-gurume', // 사용자 버켓 이름
            Key: shareFlow.shareThumbnail // 버켓 내 경로
          }, (err, data) => {
            if (err) { throw err; }
            console.log('s3 deleteObject ', data)
          })

        // 해시태그 삭제
        const tag = await UserTagTb.findOne({_id : '5fb7a29bf648764c3cb9ebeb'}).exec()
        tag.userTag.forEach(userTag => {
            if(shareFlow.userTags.includes(userTag.userTag)) {
                userTag.useCount--;
            }
        })

        tag.userTag = tag.userTag.filter(doc => doc.useCount !=0)

        await UserTagTb.findOneAndUpdate({_id : '5fb7a29bf648764c3cb9ebeb'}, tag)
        .exec()
        .catch(err => {
            res.status(500).json("해시태그 삭제에 실패하였습니다.");
        });
    
    

        //공유 동선 삭제
        await ShareFlowTb.findByIdAndDelete(req.body.shareFlowId)
        .exec() 
        .then(doc => {
            res.status(200).json("success")
        })
        .catch(err => {
            res.status(500).json("동선 삭제를 실패하였습니다.");
        });
    
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


// 동선 상세 페이지 조회수 증가
router.post('/shareFlowDetail', async(req, res, next) => {
    
    await ShareFlowTb.updateOne({'_id': req.body.shareFlowId}, {$inc: {hits: 1}})
    .exec()
    .then(doc => {
        res.status(201).json("success");
    })
})

// 공유 동선 상세 페이지 정보
router.get('/shareFlowDetail/:shareFlowId', async (req, res, next) => {
    // 동선 제목, 썸네일, 해시태그, 
    await ShareFlowTb.findOne({_id: req.params.shareFlowId})
    .select('shareTitle')
    .select('shareThumbnail')
    .select('adminTag')
    .select('userTags')
    .exec()
    .then(doc => {
        res.status(200).json({
            shareTitle: doc.shareTitle,
            shareThumbnail: doc.shareThumbnail,
            adminTag: doc.adminTag,
            userTags: doc.userTags
        })
    })

})
module.exports = router;