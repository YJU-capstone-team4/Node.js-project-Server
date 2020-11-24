const YtbStore = require("../../server/model/ytbStoreTb.model");
const { startSession } = require('mongoose');

const YtbStoreResolvers = {
    Query: {
      ytbStore(_, args) {
        return YtbStore.find()
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
      localYtbStore(_, args) {
        return YtbStore.find({'regionTag': args.regionTag})
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
    },

  };
  
  module.exports = YtbStoreResolvers;