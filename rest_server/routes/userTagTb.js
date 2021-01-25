const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const UserTagTb = require('../models/userTagTb.model');
router.get('/', (req, res, next) => {
  UserTagTb.find()
    // .select("name price _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            userTagTbs: docs.map(doc => {
                return {
                    _id: doc._id,
                    userTag: doc.userTag,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/userTag/' + doc.userTag
                    }
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

router.post('/', (req, res, next) => {
    const userTagTb = new UserTagTb({
        _id: new mongoose.Types.ObjectId(),
        userTag: req.body.userTag
    });
    userTagTb.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created userTagTb successfully',
            createdUserTagId: {
                _id: result._id,
                userTag: result.userTag,
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/userTagTb/' + result.userTag
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;

// ------------------------------------------------------------
// const router = require('express').Router();
// let UserTagTb = require('../models/userTagTb.model');

// // 전체 호출
// router.route('/').get((req, res) => {
//   UserTagTb.find()
//     .then(userTagTb => res.json(userTagTb))
//     .catch(err => res.status(400).json('Error: ' + err));
// });

// // 처음 한번만 사용하는 추가용 라우터
// router.route('/addFirst').post((req, res) => {
//   const userTag = req.body.userTag;

//   const newUserTagTb = new UserTagTb({
//     userTag
//   });

//   newUserTagTb.save()
//   .then(() => res.json('UserTagTb added!'))
//   .catch(err => res.status(400).json('Error: ' + err));
// });

// module.exports = router;