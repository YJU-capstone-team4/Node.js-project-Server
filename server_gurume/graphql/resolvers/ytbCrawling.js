const YtbCrawling = require("../../server/model/ytbCrawlingTb.model");
const { startSession } = require('mongoose');

const YtbCrawlingResolvers = {
    Query: {
      ytbCrawling(_, args) {
        return  YtbCrawling.find()
        .exec();
    
      },
    },
  };
  
  module.exports = YtbCrawlingResolvers;