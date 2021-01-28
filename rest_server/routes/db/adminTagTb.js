const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
router.get('/', (req, res, next) => {
  AdminTagTb.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            adminTagTbs: docs.map(doc => {
                return {
                    _id: doc._id,
                    adminTag: doc.adminTag,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/adminTag/' + doc.adminTag
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

// 관리자 해시태그 검색 - 지역 - 보류
router.get('/:adminTag', (req, res, next) => {
    AdminTagTb.find({
        "adminTag.regionTag" : req.params.adminTag
    })
    .exec()
    .then(docs => {
        res.status(200).json({
            docs
        }); 
    }).catch(err => {
        console.log(err);
    });
});

// router.post('/', (req, res, next) => {
//     const adminTagTb = new AdminTagTb({
//         _id: new mongoose.Types.ObjectId(),
//         adminTag: req.body.adminTag
//     });
//     adminTagTb.save()
//     .then(result => {
//         console.log(result);
//         res.status(201).json({
//             message: 'Created adminTagTb successfully',
//             createdAdminTagId: {
//                 _id: result._id,
//                 adminTag: result.adminTag,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:5000/adminTagTb/' + result.adminTag
//                 }
//             }
//         });
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// 관리자 해시태그 추가 - 보류
router.patch('/:userId', (req, res, next) => {
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    UserTb.update({userId : req.params.userId}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(201).json({
            message: 'UserTb updated',
            request: {
                type: 'GET',
                url: 'http://localhost:5000/userTb' + userId
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// 관리자 해시태그 삭제 - 보류
router.delete('/:userId', (req, res, next) => {
    UserTb.remove({userId : req.params.userId})
    // const id = req.params.productId;
    // UserTb.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'UserTb deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:5000/userTb/',
                // body: { name: 'String', price: 'Number' }
            }
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;