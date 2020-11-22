const UserFlow = require("../../server/model/userFlowTb.model");
const { startSession } = require('mongoose');

const UserFlowResolvers = {
    Query: {
      userFlow(_, args) {
        return UserFlow.find()
        .populate('../../server/model/userTbId')
      //  .populate('../../server/model/folders.stores.ytbStoreTbId')
        .populate({
          path: '../../server/model/folders.stores.ytbStoreTbId',
          populate: { path: 'adminTagTbId' }
      })
        .populate('../../server/model/folders.stores.attractionTbId')
        .exec();
      },
      // oneFlow(_, args) {
      //   return UserFlow.find({'adminTag.regionTag': args.regionTag})
      //   .select()
      //   .sort('-likeUp')
      //   .populate('../../server/model/userTbId')
      //   .populate('../../server/model/userFlowTbId')
      //   .populate('../../server/model/adminTagTbId')
      //   .exec();
      // },
    },
  };
  
  module.exports = UserFlowResolvers;