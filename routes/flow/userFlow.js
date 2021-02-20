const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const userCheck = require('../index');
const UserTb = require('../../models/userTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const { response } = require('express');


// 로그인 확인
const authenticateUser = async (req, res, next) => {
	if (req.isAuthenticated()) {
	  res.status(200);
	} else {
	  res.status(301);
	}
  };



  router.get('/userFlow/', async (req, res, next) => {
    try {
        req.params.user_id='payment'
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

       return res.status(200).json( {           
           shareFlow,
        userFlow}

       )
        
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
router.put('/userFlow/folder', async (req, res, next) => {
    try {
        req.body.userId = "payment"
        // user 정보 검색
        const user = await UserTb
            .findOne({
                "userId": req.body.userId
            })
            .exec()
            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.body.folderId) {
                    index = tmp;
                }
                tmp++;
            });
            console.log(user.folders[0].stores)

        //바뀐 store 순서대로 정렬
        let changeStores = [] 
        user.folders[index].stores.forEach(element => {
            changeStores[req.body.storeIds.indexOf(element.storeId)] = element;

        })
        user.folders[index].stores = changeStores;

        mongoose.set('useFindAndModify', false);
        // 바뀐 store 배열로 update 해주기
        await UserTb
        .findOneAndUpdate({
            "userId": req.body.userId
        }, user)
        .exec()
        .then(doc => {
            res.status(201).json("success")
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } catch(e) {
        res.status(500).json({
            error: e
        });
    } 

});


// 유저 폴더 만들기
router.post('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
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
                res.status(201).json("success")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유저 폴더 수정
router.put('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
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
                res.status(201).json("success")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유저 폴더 지우기
router.delete('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });

            user.folders.splice(index,1);

            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json("success")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 즐겨찾기 한 가게 폴더에 추가
router.post('/favorite', async (req, res, next) => {
    try {
        req.body.user_id = 'payment';
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });

            let inputStore = {
                    'ytbStoreTbId': req.body.store_id,
                    'attractionTbId': req.body.attraction_id,
                    'storeId': req.body.store_id,
                    'typeStore': req.body.typeStore
                }

            user.folders[index].stores.push(inputStore);

            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json("success")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});


// 즐겨찾기 삭제
router.delete('/favorite', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });
            console.log(user.folders[index]);

            let i = 0
            tmp = 0
            user.folders[index].stores.forEach(element => {
                if(element.storeId == req.body.store_id) {
                    i = tmp;
                }
                tmp++;
            });

            user.folders[index].stores.splice(i,1)

            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json("success")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

module.exports = router;