const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTagTb = require('../../models/userTagTb.model');
const UserTb = require('../../models/userTb.model');

router.get('/flowSearch', (req, res, next) => {
    AdminTagTb.find()
      .exec()
      .then(docs => {
          const response = {
              count: docs.length,
              adminTagTb: docs.map(doc => {
                  return {
                      _id: doc._id,
                      //adminTag: doc.adminTag,
                      seasonTag: doc.adminTag.seasonTag,
                      regionTag: doc.adminTag.regionTag
                  }
              })
          };
          res.status(200).json(response);
      }).catch(err => {
          console.log(err);
          res.status(500).json({
              error: err
          });
      });
  });

// shareFlowTb에서 아이디로 검색
router.get('/flowSearch/shareFlow/:user_id', (req, res, next) => {
    ShareFlowTb.find({userId : req.params.user_id})
    .exec()
    .then(docs => {
        res.status(200).json({
            shareFlowCount: docs.length
            //docs
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


// 동선 검색 - 해시태그 검색
router.get('/flowSearch/tag/:user_tag', (req, res, next) => {
    UserTagTb.find({'userTag': {$regex:req.params.user_tag}})
    .exec()
    .then(docs => {
        const response = {
            userTagTbs: docs.map(doc => {
                let tag = []
                
                doc.userTag.forEach(element => {

                    if(element.includes(req.params.user_tag))
                        tag.push(element);
                });

                return {
                    _id: doc._id,
                    userTag: tag
                }
            })
        };
        res.status(200).json(response);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// 동선 검색
router.post('/flowSearch/flow/', async (req, res, next) => {
    // 해시태그로 검색
    await ShareFlowTb.find()
    .where('adminTag.regionTag').in(req.body.regionTag)
     .where('adminTag.seasonTag').in(req.body.seasonTag)
    .where('userTags').in(req.body.userTag)
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            shareFlowTb: docs.map(doc => {
                return {
                _id: doc._id,
                shareTitle: doc.shareTitle,
                shareThumbnail: doc.shareThumbnail,
                adminTag: doc.adminTag,
                userTags: doc.userTags,
            }})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

    // 타이틀로 검색
    await ShareFlowTb.find({'shareTitle': {$regex:req.body.shareTitle}})
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            shareFlowTb: docs.map(doc => {
                return {
                _id: doc._id,
                shareTitle: doc.shareTitle,
                shareThumbnail: doc.shareThumbnail,
                adminTag: doc.adminTag,
                userTags: doc.userTags,
            }})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

    // Nickname으로 검색
    const user = await UserTb.find({'nickname': req.body.nickname})
    .select('userId')
    .exec();

    await ShareFlowTb.find({'userId': user.userId})
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            shareFlowTb: docs.map(doc => {
                return {
                _id: doc._id,
                shareTitle: doc.shareTitle,
                shareThumbnail: doc.shareThumbnail,
                adminTag: doc.adminTag,
                userTags: doc.userTags,
            }})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });


});

module.exports = router;