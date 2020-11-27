const UserFlow = require("../../server/model/userFlowTb.model");
const User = require("../../server/model/userTb.model");
const YtbStore = require("../../server/model/ytbStoreTb.model");
const Attraction = require("../../server/model/attractionTb.model");

const { startSession } = require('mongoose');

const UserFlowResolvers = {
    Query: {
      userFlow(_, args) {
        return UserFlow.find()
        .populate('../../server/model/userTbId')
        .populate({
          path: '../../server/model/folders.stores.ytbStoreTbId',
          populate: { path: '../../server/model/adminTagTbId' }
        })
        .populate('../../server/model/folders.stores.attractionTbId')
        .exec();
      },
    },

    userFlowTb : {
      async userTbId(_, args) {
        const user = await User.findById(_.userTbId._id);
        return user;
      },
    },
    store : 
      {
      async ytbStoreTbId(_, args) {
        const ytbStore = await YtbStore.findById(_.ytbStoreTbId);
        return ytbStore;
      },
      async attractionTbId(_, args) {
        const attraction = await Attraction.findById(_.attractionTbId);
        return attraction;
      },
    }
    
    
  };

  module.exports = UserFlowResolvers;