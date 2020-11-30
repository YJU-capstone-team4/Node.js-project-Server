const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const UserResolvers = {
    Query: {
      user(_, args) {
        return User.find()
        .populate('../../server/model/folders.stores.ytbStoreTbId');
      },
      selectFlow(_, args) {
        return User.find({'folders._id' : args._id})
        .populate('../../server/model/folders.stores.ytbStoreTbId');
      }
    },
    store : 
    {
    async ytbStoreTbId(_, args) {
      const ytbStore = await YtbStore.findById(_.ytbStoreTbId);
      return ytbStore;
    },
  }

  };
  
  module.exports = UserResolvers;