const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SearchTb = require('../../models/searchTb.model');
router.get('/', (req, res, next) => {
  SearchTb.find()
    .exec()
    .then(docs => {
        if (res.status == 404)
            res.status(404).json({
                error: 'Not Found'
            })
        else
            res.status(200).json(docs);
    }).catch(err => {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
});

module.exports = router;