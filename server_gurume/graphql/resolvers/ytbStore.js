const YtbStore = require("../../server/model/ytbStoreTb.model");
const AdminTag = require("../../server/model/adminTagTb.model");
const { startSession } = require('mongoose');

const YtbStoreResolvers = {
    Query: {
      ytbStore(_, args) {
        return YtbStore.find({})
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
    // localYtbStore(_, args) {
    //   return YtbStore.find({'regionTag': args.regionTag})
    //   .populate('../../server/model/adminTagTbId')
    //   .exec();
    // },
  },
  ytbStoreTb : {
    async adminTagTbId(_, args) {
      const adminTag = await AdminTag.findById(_.adminTagTbId._id);
      return adminTag;
    },
  }

};
  
  module.exports = YtbStoreResolvers;