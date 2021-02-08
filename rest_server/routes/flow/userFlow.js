const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const userCheck = require('../index');
const UserTb = require('../../models/userTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");


// 로그인 확인
const authenticateUser = (req, res, next) => {
	if (req.isAuthenticated()) {
        //console.log(req.user.userId);
	  next();
	} else {
	  res.status(301).redirect('/login');
	}
  };

// 유저가 등록한 동선 폴더 리스트
router.get('/folderList/:user_id', (req, res, next) => {
    try {
        let shareFlow = ShareFlowTb.findOne({userId : req.params.user_id})
        .select('folderTitle')
        .exec()
        console.log(shareFlow);

        //console.log(req.params.user_id)
        // 공유된 폴더 제외
        let titles = []
        shareFlow.forEach(doc => {
            titles.push(doc.folderTitle);
        })

        let userFlow = UserTb.find({
            userId : req.params.user_id,
            'folders.folderTitle' : {$ne : shareFlow.folderTitle} 
        })
        .select('folders._id')
        .select('folders.folderTitle')
        .exec()
        .then(doc => {

            // console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    userFlow: doc,
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
        
    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
});

    // let shareFlow = ShareFlowTb.find({userId : req.params.user_id})
    // .select('folderTitle')
    // .exec()
    // .then(doc => {
    //     // console.log("From database", doc);
    //     if (doc) {
    //         res.status(200).json({
    //             shareFlow: doc,
    //         });
    //     } else {
    //         res.status(404)
    //         .json({
    //             message: "No valid entry found for userId"
    //         })
    //     }
    // }).catch(err => {
    //     console.log(err);
    // });
// });

// 검색한 폴더의 각 맛집, 위치
router.get('/userFlow/folder/:folderId', (req, res, next) => {
    UserTb.findOne({
        "folders._id": req.params.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.params.folderId
            }
        }
    })
    .select('stores')
    .populate({path :'folders.stores.ytbStoreTbId',
                select: 'storeInfo.location storeInfo.storeName storeInfo.storeAddress', 
                'ytbStoreTbId': {$ne: null}})
    .populate({path : 'folders.stores.attractionTbId',
                select: 'attractionInfo.location attractionInfo.attractionName attractionInfo.attractionAddress', 
                'attractionTbId': {$ne: null}})
    .exec()
    .then(docs => {

        console.log(docs);
        res.status(200).json({
            //folderTitle : docs[0].folders[0].folderTitle,
            stores : docs.folders[0].stores
            
            

        }); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 선택한 폴더 내의 stores 순서 바꿀 때
router.put('/userFlow/folder', (req, res, next) => {
    //console.log(req.body.folderId)
    UserTb.findOne({
        "folders._id": req.body.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.body.folderId
            }
        }
    })
    .exec()
    .then(docs => {
        let stores = []
        let i = 0;
        docs.folders[0].stores.forEach(element => {
            stores[req.body.storeIds[i]] = element;
            i++;
        })
        console.log(stores);
        console.log(docs);
        const response = UserTb.
        updateOne({
        "folders._id": req.body.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.body.folderId
            }
        }
    }, {$set: {'folders[0].stores' : stores}})
        //.update({$set: {'folders[0].stores' : stores}})
        .exec()
        .then(docs => {
            res.status(200).json({
            docs
            })
        })

    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

    //process.exit(0);
    // 배열(storeId) 입력 받은 순서 대로 새로운 배열에 객체 저장

//});



module.exports = router;