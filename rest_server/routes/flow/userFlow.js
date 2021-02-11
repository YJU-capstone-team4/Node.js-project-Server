const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const userCheck = require('../index');
const UserTb = require('../../models/userTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const { response } = require('express');


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
router.get('/folderList/:user_id', async (req, res, next) => {
    try {
        // 공유 동선
        const shareFlow = await ShareFlowTb.find({userId : req.params.user_id})
        .select('folderId')
        .select('shareTitle')
        .exec()

        // 공유 되지 않은 동선
        const userFlow = UserTb.find({
            userId : req.params.user_id,
            'folders._id' : {$ne : shareFlow.folderId} 
        })
        .select('folders._id')
        .select('folders.folderTitle')
        .exec()

       return res.status(200).json({
           shareFlow,
           userFlow
       })
        
    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
});

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
                select: 'storeInfo.location storeInfo.storeName storeInfo.storeAddress'})
    .populate({path : 'folders.stores.attractionTbId',
                select: 'attractionInfo.location attractionInfo.attractionName attractionInfo.attractionAddress'})
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
// router.put('/userFlow/folder', async (req, res, next) => {
//     try {
        //console.log(req.body.folderId)

        // 원래 폴더의 store 순서 가져오기
        // const stores = await UserTb.findOne({
        //     "folders._id": req.body.folderId
        // },{
        //     "_id": 0,
        //     "folders": {
        //         "$elemMatch": {
        //         "_id": req.body.folderId
        //         }
        //     }
        // })
        // .exec()

        // 바뀐 store 순서대로 정렬
        // let changeStores = []
        // let i = 0; 
        // stores.folders[0].stores.forEach(element => {
        //     changeStores[req.body.storeIds[i]] = element;
        //     i++;
        // })
        // console.log(changeStores)

        //let query = 
        // {
        //     "_id": 0,
        //     "folders": {
        //         "$elemMatch": {
        //         "_id": req.body.folderId
        //         }
        //     }
        // }
    //     mongoose.set('useFindAndModify', false);
    //     // 바뀐 store 배열로 update 해주기
    //     await UserTb
    //     .findOneAndUpdate({
    //         "_id": '5fc4de021bd7047198cb4a29'
    //     }, 
    //            {
    //             "userId": "Chips",
    //             "social": "Google",
    //             "nickname": "Mag",
    //             "memo": "",
    //             "likeYoutuber": [
    //             ],
    //             "likeFlows": [
    //             ],
    //             "folders": [
    //                 {
    //                     "_id": "5fb797b5af3c922f9490fa9c",
    //                     "stores": [  {
    //                         _id: '5fb797beaf3c922f9490fab0',
    //                         ytbStoreTbId: null,
    //                         attractionTbId: '5fb7880d2c709478800b2aa5',
    //                         storeId: '5fb7880d2c709478800b2aa5',
    //                         typeStore: '카페'
    //                       },
    //                       {
    //                         _id: '5fb797beaf3c922f9490faaf',
    //                         ytbStoreTbId: '5fb7638df89ca73168b311ad',
    //                         attractionTbId: null,
    //                         storeId: '5fb7638df89ca73168b311ad',
    //                         typeStore: '맛집'
    //                       },
    //                       {
    //                         _id: '5fb797beaf3c922f9490faae',
    //                         ytbStoreTbId: '5fb76388f89ca73168b311ac',
    //                         attractionTbId: null,
    //                         storeId: '5fb76388f89ca73168b311ac',
    //                         typeStore: '맛집'
    //                       },
    //                       {
    //                         _id: '5fb797beaf3c922f9490faad',
    //                         ytbStoreTbId: null,
    //                         attractionTbId: '5fb787f52c709478800b2aa2',
    //                         storeId: '5fb787f52c709478800b2aa2',
    //                         typeStore: '관광지'
    //                       },
    //                       {
    //                         _id: '5fb797beaf3c922f9490faac',
    //                         ytbStoreTbId: '5fb76382f89ca73168b311ab',
    //                         attractionTbId: null,
    //                         storeId: '5fb76382f89ca73168b311ab',
    //                         typeStore: '맛집'
    //                       }]
    //                 }
    //             ]
    //         })
        
    //     //{$set: {'folders[0].stores': changeStores}},

        
    //     .exec()
    //     //, 
    //     // .updateOne(
    //     //     {
    //     //         "folders.stores": stores
    //     //     },
    //     // {$set: {'folders[0].stores': changeStores}})
    //     // .exec()
    //     .then(doc => {
    //         res.status(200).json(doc)
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             error: err
    //         });
    //     });
    // } catch(e) {
    //     res.status(500).json({
    //         error: e
    //     });
    // } 

//     await UserTb
//     .updateOne(
//         {"folders.stores": stores}
//     , {'folders.stores': changeStores}, {new: true})
//     .exec()
//     .then(doc => {
//         res.status(200).json(doc)
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// } catch(e) {
//     res.status(500).json({
//         error: e
//     });
// } 
//});

    //process.exit(0);
    // 배열(storeId) 입력 받은 순서 대로 새로운 배열에 객체 저장

//});

// 유저 폴더 만들기

router.put('/userFlow/make', async (req, res, next) => {
    try {
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            user.folders.push({
                folderTitle: req.body.folderTitle,
                createDate: new Date(),  
                updateDate: null,
                stores: []               
            })
            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json({
                    doc
                })
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});



module.exports = router;