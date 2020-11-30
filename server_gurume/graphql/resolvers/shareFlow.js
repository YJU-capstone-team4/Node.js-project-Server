const ShareFlow = require("../../server/model/shareFlowTb.model");
const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const ShareFlowResolvers = {
    Query: {
      shareFlow(_, args) {
        return ShareFlow.find()
        .populate('../../server/model/userTbId')
        .exec();
      },
      localShareFlow(_, args) {
        return ShareFlow.find({'adminTag.regionTag': args.regionTag})
        .select()
        .sort('-hits')
        .populate('../../server/model/userTbId')
        .exec();
      },
    },
    shareFlowTb : {
      async userTbId(_, args) {
        const user = await User.findById(_.userTbId._id);
        return user;
      },
  },
  Mutation: {
    async createShareFlow(_, {shareFlowInput}) {
      return await ShareFlow.create(shareFlowInput);
    } 
  }
  };
  
  module.exports = ShareFlowResolvers;