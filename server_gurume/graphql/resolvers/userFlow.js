const UserFlow = require("../../server/model/userFlowTb.model");
const { startSession } = require('mongoose');
const DataLOeader = require('dataloader');


const UserFlowResolvers = {
    Query: {
      userFlow(_, args) {
        const result =  UserFlow.find()
        .populate('../../server/model/userTbId')
        .populate('../../server/model/folders.stores.ytbStoreTbId')
        .populate({
          path: '../../server/model/folders.stores.ytbStoreTbId',
          populate: { path: '../../server/model/adminTagTbId' }
      })
        .populate('../../server/model/folders.stores.attractionTbId')
        .exec()
        .then();
        return result;
      }
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