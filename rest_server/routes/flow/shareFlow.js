const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTb = require('../../models/userTb.model');
const { route } = require('../db/userTb');

// // 유저가 등록한 동선 폴더 리스트(공유한 폴더 제외)
router.get('/shareFlow/folderList/:user_id', (req, res, next) => {

    const docs = ShareFlowTb.find({userId : req.params.user_id})
    .select('folderTitle')
    .exec();

    //console.log(req.params.user_id)
    UserTb.find({userId : req.params.user_id})
    .where('folders.folderTitle')
    .ne(docs.folderTitle)
    .select('folders._id')
    .select('folders.folderTitle')
    .exec()
    .then(doc => {
        // console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                userTb: doc,
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for userId"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});


//  동선 제목, 썸네일 저장 후 성공 여부 반환

router.post('/shareFlow/folder', (req, res, next) => {
    // 로그인 검사 후 필요한 유저정보 반환
    const userInfo = UserTb.findOne({userId : req.params.user_id})
    .exec()

    console.log(userInfo[0]._id);
    console.log(userInfo[0].userId);
    process.exit(1)
    // shareFlowTb에 들어갈 내용 저장
    const shareFlowTb = new ShareFlowTb({
      _id: new mongoose.Types.ObjectId(),
      userTbId: req.body.userTbId,
      userId: req.body.userId,
      shareTitle: req.body.shareTitle,
      shareThumbnail: req.body.shareThumbnail,
      folderTitle: req.body.folderTitle,
      adminTag: req.body.adminTag,
      userTags: req.body.userTags,
      shareDate: req.body.shareDate,
      updateDate: req.body.updateDate,
      likeCount: req.body.likeCount,
      hits: req.body.hits,
    });
    shareFlowTb.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
          message: 'shareFlowTb stored',
          createdShareFlowTb: {
              _id: result._id,
              userTbId: result.userTbId,
              userId: result.userId,
              shareTitle: result.shareTitle,
              shareThumbnail: result.shareThumbnail,
              folderTitle: result.folderTitle,
              adminTag: result.adminTag,
              userTags: result.userTags,
              shareDate: result.shareDate,
              updateDate: result.updateDate,
              likeCount: result.likeCount,
              hits: result.hits,
          },
      });
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({
          error: err
      });
  });
});

// 동선 제목, 썸네일 수정 후 성공 여부 반환

// 동선 제목, 썸네일 삭제 후 성공 여부 반환
module.exports = router;