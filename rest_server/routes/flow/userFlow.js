const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const UserTb = require('../../models/userTb.model');

// 유저가 등록한 동선 폴더 리스트
// userId로 값 찾기
router.get('/userFlow/folderList/:user_id', (req, res, next) => {
    UserTb.find({userId : req.params.user_id})
    .select('folders._id')
    .select('folders.folderTitle')
    .exec()
    .then(doc => {
        // console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                userTb: doc,
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for userId"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});

// 검색한 폴더의 각 맛집, 위치
router.get('/userFlow/folder/:folderId', (req, res, next) => {
    UserTb.find({
        "folders._id": req.params.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.params.folderId
            }
        }
    })
    
    .populate({path :'folders.stores.ytbStoreTbId',
                select: 'storeInfo'})
    .populate({path : 'folders.stores.attractionTbId',
                select: 'attractionInfo'})
    .exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json({
            folderTitle : docs[0].folders[0].folderTitle,
            stores : docs[0].folders[0].stores
            
            

        }); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;