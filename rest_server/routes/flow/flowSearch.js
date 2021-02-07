const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTagTb = require('../../models/userTagTb.model');

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
router.post('/flowSearch/flow/', (req, res, next) => {
    console.log(req.body.adminTag);
    // ShareFlowTb.find({userId : req.params.user_tag})
    // ShareFlowTb.find()
    // .exec()
    // .then(docs => {
    //     res.status(200).json({
    //         shareFlowCount: docs.length,
    //         docs
    //     });
    // })
    // .catch(err => {
    //     res.status(500).json({
    //         error: err
    //     });
    // });
});

module.exports = router;