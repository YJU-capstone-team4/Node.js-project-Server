const YtbReq = require("../../server/model/ytbReqTb.model");
const { startSession } = require('mongoose');

const YtbReqResolvers = {
    Query: {
      ytbReq(_, args) {
        return YtbReq.find()
        .populate('../../server/model/userTbId')
        .exec();
      },
    },
  };
  
  module.exports = YtbReqResolvers;