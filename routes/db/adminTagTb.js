const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
router.get('/', (req, res, next) => {
  AdminTagTb.findOne( { 'adminTag.seasonTag' : { $in : '봄' } } )
    .exec()
    .then(docs => {
        res.status(200).json(docs);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
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
        if (res.status == 404)
            res.status(404).json({
                error: 'Not Found'
            })
        else
            res.status(200).json(docs);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

router.post('/', (req, res, next) => {
    const adminTagTb = new AdminTagTb({
        _id: new mongoose.Types.ObjectId(),
        adminTag: req.body.adminTag
    });
    adminTagTb.save()
    .then(result => {
        console.log(result); 
        res.status(200).json({
            message: 'Created adminTagTb successfully',
            createdAdminTagId: {
                _id: result._id,
                adminTag: result.adminTag,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/adminTagTb/' + result.adminTag
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

// 관리자 해시태그 추가
router.patch('/insert/:newAdminTag', (req, res, next) => {
    AdminTagTb.update({ 'adminTag.regionTag': '서울특별시' }, { $push: { 'adminTag.regionTag': req.params.newAdminTag } })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'adminTagTb insert',
            request: {
                value: req.params.newAdminTag,
                request: {
                    type: 'Insert',
                    url: 'http://localhost:3000/adminTag/insert' + req.params.newAdminTag,
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

// 관리자 해시태그 삭제
router.delete('/delete/:newAdminTag', (req, res, next) => {
    AdminTagTb.update({ 'adminTag.regionTag': req.params.newAdminTag }, { $pull: { 'adminTag.regionTag': req.params.newAdminTag } })
    .exec()
    .then(result => {
        if (res.status == 404)
            res.status(404).json({
                error: 'Not Found'
            })
        else
            res.status(200).json({
                value: req.params.newAdminTag,
                request: {
                    type: 'Delete',
                    url: 'http://localhost:3000/adminTag/delete' + req.params.newAdminTag,
                }
            })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

module.exports = router;