const ShareFlow = require("../../server/model/shareFlowTb.model");
const { startSession } = require('mongoose');

const ShareFlowResolvers = {
    Query: {
      shareFlow(_, args) {
        return ShareFlow.find()
        .populate('../../server/model/userTbId')
        .populate('../../server/model/userFlowTbId')
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
      localShareFlow(_, args) {
        return ShareFlow.find({'adminTag.regionTag': args.regionTag})
        .select()
        .sort('-likeUp')
        .populate('../../server/model/userTbId')
        .populate('../../server/model/userFlowTbId')
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
    },
  };
  
  module.exports = ShareFlowResolvers;