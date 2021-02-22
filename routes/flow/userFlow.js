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

        let ids = []

        shareFlow.forEach(element => {
            ids.push(element.folderId);
        })

        // 공유 되지 않은 동선
        let userFlow = await UserTb.findOne
        (
            {userId : req.params.user_id}
        )
        //.find({'folders._id': {$nin: ids}})
        .select('folders._id')
        .select('folders.folderTitle')
        .exec()
        
        let flow = []
        userFlow.folders.forEach(folder => {
            share = false
            ids.forEach(id => {
                if(folder._id == id.toString()){
                    share = true;
                }
            }) 
            flow.push({_id: folder._id,
                        folderTitle: folder.folderTitle,
                        share : share})
          })
          
       return res.status(200).json(flow)
        
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
        let stores = [];
        docs.folders[0].stores.forEach(element => {
            if(!element.ytbStoreTbId) { // 관광지, 카페
                stores.push({
                    storeName: element.attractionTbId.storeInfo.attractionName,
                    storeAddress: element.attractionTbId.storeInfo.attractionAddress,
                    location: element.attractionTbId.storeInfo.location,
                    storeId: element.storeId,
                    typeStore: element.typeStore

                })
            }else {// 맛집
                stores.push({
                    storeName: element.ytbStoreTbId.storeInfo.storeName,
                    storeAddress: element.ytbStoreTbId.storeInfo.storeAddress,
                    location: element.ytbStoreTbId.storeInfo.location,
                    storeId: element.storeId,
                    typeStore: element.typeStore
                })
            }
        })

        res.status(200).json(stores); 
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
                createDate: getCurrentDate(new Date()),  
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

            let index = 0
            let tmp = 0
            let ids = []
            user.folders.forEach(element => {
                ids.push(element._id.toString())
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });

            user.folders[index] = ({
                folderTitle: req.body.folderTitle,
                createDate: user.folders[index].createDate,  
                updateDate: getCurrentDate(new Date()),
                stores: user.folders[index].stores               
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
            let ids = []
            user.folders.forEach(element => {
                ids.push(element._id.toString())
                if(element._id == req.body.folder_id) {
                    index = tmp;
                    console.log(element._id == req.body.folder_id)
                    console.log(index)
                }
                tmp++;
            });
            if(ids.includes(req.body.folder_id)){
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
            }else {
                res.status(200).json("해당 폴더를 찾을 수 없습니다.")
            }



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
            let ids = []
            user.folders.forEach(element => {
                ids.push(element._id)
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });
            if(ids.includes(req.body.folder_id.toString())) {
                if(req.body.typeStore == "맛집") {
                    let inputStore = {
                        'ytbStoreTbId': req.body.store_id,
                        'attractionTbId': null,
                        'storeId': req.body.store_id,
                        'typeStore': req.body.typeStore
                    }
                } else {
                    let inputStore = {
                        'ytbStoreTbId': null,
                        'attractionTbId': req.body.store_id,
                        'storeId': req.body.store_id,
                        'typeStore': req.body.typeStore
                    }
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
            }else {
                res.status(200).json("선택하신 폴더가 존재하지 않습니다.")
            }



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
            let ids = []
            user.folders[index].stores.forEach(element => {
                ids.push(element.storeId)
                console.log(element.storeId == req.body.store_id.toString())
                if(element.storeId == req.body.store_id) {
                    i = tmp;
                }
                tmp++;
            });
            if(ids.includes(req.body.store_id.toString())) {
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
    
            }else {
                res.status(400).json("해당 가게가 동선에 포함되어 있지 않습니다.")
            }


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

module.exports = router;