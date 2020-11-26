const ShareFlow = require("../../server/model/shareFlowTb.model");
const User = require("../../server/model/userTb.model");
const UserFlow = require("../../server/model/userFlowTb.model");
const AdminTag = require("../../server/model/adminTagTb.model");
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
        .sort('-hits')
        .populate('../../server/model/userTbId')
        .populate('../../server/model/userFlowTbId')
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
    },
    shareFlowTb : {
      async userTbId(_, args) {
        const user = await User.findById(_.userTbId._id);
        return user;
      },
      async userFlowTbId(_, args) {
        const userFlow = await UserFlow.findById(_.userFlowTbId._id);
        return userFlow;
      },
      async adminTagTbId(_, args) {
        const adminTag = await AdminTag.findById(_.adminTagTbId._id);
        return adminTag;
      },
  },
  };
  
  module.exports = ShareFlowResolvers;