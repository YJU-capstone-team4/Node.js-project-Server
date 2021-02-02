const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbStoreTb = require("../../models/ytbStoreTb.model");
const ShareFlowTb = require("../../models/shareFlowTb.model");
const AttractionTb = require("../../models/attractionTb.model");
const UserTb = require('../../models/userTb.model');

router.get('/storeDetail/store/:store_id', (req, res, next) => {
    YtbStoreTb.find({_id: req.params.store_id})
    .select()
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbStoreTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    storeName: doc.storeInfo.storeName,
                    storeAddress:doc.storeInfo.storeAddress,
                    location: doc.storeInfo.location,
                }
            })
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


//populated 안 값 쿼리 - 간단 버전
router.get('/storeDetail/flow/:store_id', async (req, res, next) => {
    try {
        //const docs = await UserTb.find({
        UserTb.find({
            "folders.stores.storeId": req.params.store_id
        }, {
            '_id': 0,
            'folders': {

                    "$elemMatch": {
                        'stores.storeId':req.params.store_id
                    }
                

            }
        })
        //.select('folders[0]._id')
        .populate('folders.stores.ytbStoreTbId')
        .populate('folders.stores.attractionTbId')
        .exec()
        .then(docs => {
            console.log(docs)
            res.status(200).json({
                docs
            }); 
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

    //     const data = await YtbReqTb.find({
    //           "userTbId": {$in:ids}
    //       })
    //       .populate({
    //           path: 'userTbId'
    //       })
    //       .exec()

    //     return res.status(200).json({
    //         data
    //     }); 
    } catch(e) {
        res.status(500).json({
            error: e
        });
     }
});

// router.get('/storeDetail/flow/:store_id', (req, res, next) => {
//     // userTb 에서 storeId가 포함된 폴더 검색
//     const docs = UserTb.find({
//         "folders.stores.ytbStoreTbId": req.params.store_id
//     },{
//         "_id": 0,
//         "folders" : {
//             //"_id":0,
//             "stores": {
//                 "$elemMatch": {
//                     "ytbStoreTbId": req.params.store_id
//                 }
//             }
//         }

//     })
//     .populate('folders.stores.ytbStoreTbId')
//     .populate('folders.stores.attractionTbId')
//     .exec()
//     // .then(docs => {
//     //     res.status(200).json({
//     //         docs
//     //     }); 
//     // })
//     // .catch(err => {
//     //     res.status(500).json({
//     //         error: err
//     //     });
//     // });

//     console.log(docs);
//     //process.exit(1);

//     // 검색한 폴더 id를 이용하여 shareFlowTb에서 재 검색

//     // ShareFlowTb.find({})
//     // .select()
//     // .populate('userTbId')
//     // .exec()
//     // .then(docs => {
//     //     res.status(200).json({
//     //         count: docs.length,
//     //         shareFlowTb: docs.map(doc => {
//     //             return {
//     //                 _id: doc._id,
//     //                 userTbId: doc.userTbId,
//     //                 userId: doc.userId,
//     //                 shareTitle: doc.shareTitle,
//     //                 shareThumbnail: doc.shareThumbnail,
//     //                 folderTitle: doc.folderTitle,
//     //                 adminTag: doc.adminTag,
//     //                 userTags: doc.userTags,
//     //                 shareDate: doc.shareDate,
//     //                 updateDate: doc.updateDate,
//     //                 likeup: doc.likeup,
//     //                 hits: doc.hits,
//     //             }
//     //         })
//     //     });
        
//     // })
//     // .catch(err => {
//     //     res.status(500).json({
//     //         error: err
//     //     });
//     // });
// });



router.get('/storeDetail/attraction/:lat,:log', (req, res, next) => {

    console.log(lat, log);
    // AttractionTb.find()
    // .select()
    // .populate('adminTagTbId')
    // .exec()
    // .then(docs => {
    //     res.status(200).json({
    //         count: docs.length,
    //         attractionTb: docs.map(doc => {
    //             return {
    //                 _id: doc._id,
    //                 attractionInfo: doc.attractionInfo,
    //                 regionTag: doc.regionTag,
    //             }
    //         })
    //     });
        
    // })
    // .catch(err => {
    //     res.status(500).json({
    //         error: err
    //     });
    // });
});

module.exports = router;