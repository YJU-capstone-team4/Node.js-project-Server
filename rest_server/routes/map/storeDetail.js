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

router.get('/storeDetail/flow/:store_id', async (req, res, next) => {
    try {
        const docs = await UserTb.find({
                "folders.stores.storeId": req.params.store_id
            },{
                "_id": 0,
                "folders": {
                    "$elemMatch": {
                    "stores.storeId": req.params.store_id
                    }
                }
            })
            .exec()

            let ids = []
            docs.forEach(doc => {
                ids.push(doc.folders[0].folderTitle);
    
            });

            await ShareFlowTb.find({
                'folderTitle': {$in:ids}
            })
            .exec()
            .then(docs => {
              res.status(200).json({
                shareFlowTb: docs.map(doc => {
                      return {
                          _id: doc._id,
                          shareTitle: doc.shareTitle,
                          shareThumbnail: doc.shareThumbnail,
                          adminTag: doc.adminTag,
                          userTags: doc.userTags,
                      }
                  })
              })
          }) 

    } catch(e) {
        res.status(500).json({
            error: e
        });
     }
});


router.get('/storeDetail/attraction/:lat&:lng', (req, res, next) => {
    AttractionTb.find()
    .where('attractionInfo.location.lat').gt(req.params.lat-5).lt(req.params.lat+5)
    .where('attractionInfo.location.lat').gt(req.params.lng-5).lt(req.params.lng+5)
    .select()
    .populate('adminTagTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            attractionTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    attractionInfo: doc.attractionInfo,
                    regionTag: doc.regionTag,
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

module.exports = router;