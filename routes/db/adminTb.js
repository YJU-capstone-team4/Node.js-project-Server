const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTb = require('../../models/adminTb.model');
router.get('/', (req, res, next) => {
  AdminTb.find()
    // .select("name price _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            adminTbs: docs.map(doc => {
                return {
                    _id: doc._id,
                    userId: doc.userId,
                    password: doc.password,
                    nickname: doc.nickname,
                    loginToken: doc.loginToken,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/adminTb/' + doc.userId
                    }
                }
            })
        };
        res.status(200).json(response);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

router.post('/', (req, res, next) => {
    const adminTb = new AdminTb({
        _id: new mongoose.Types.ObjectId(),
        userId: req.body.userId,
        password: req.body.password,
        nickname: req.body.nickname,
        loginToken: req.body.loginToken
    });
    adminTb.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created adminTb successfully',
            createdAdminId: {
                _id: result._id,
                userId: result.userId,
                password: result.password,
                nickname: result.nickname,
                loginToken: result.loginToken,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
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

router.get('/:adminId', (req, res, next) => {
    AdminTb.findOne({userId : req.params.adminId})
    // .select('name price _id')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                adminTb: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/adminTb'
                }
            });
        } else {
            res.status(404)
            .json({
                message: "Not Found"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});

module.exports = router;