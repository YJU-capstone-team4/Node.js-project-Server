const UserFlow = require("../../server/model/userFlowTb.model");
const { startSession } = require('mongoose');

const UserFlowResolvers = {
    Query: {
      userFlow(_, args) {
        return UserFlow.find()
        .populate('../../server/model/userTbId')
        .populate('../../server/model/folders.stores.ytbStoreTbId')
        .populate('../../server/model/folders.stores.attractionTbId')
        .exec();
      },
    },

  //   shareFlowTb : {
  //     async userTbId(_, args) {
  //       const user = await User.findById(_.userTbId._id);
  //       return user;
  //     },
  //     async userFlowTbId(_, args) {
  //       const userFlow = await UserFlow.findById(_.userFlowTbId._id);
  //       return userFlow;
  //     },
  //     async adminTagTbId(_, args) {
  //       const adminTag = await AdminTag.findById(_.adminTagTbId._id);
  //       return adminTag;
  //     },
  // },
  };

  module.exports = UserFlowResolvers;