const UserTag = require("../../server/model/userTagTb.model");
const { startSession } = require('mongoose');

const UserTagResolvers = {
    Query: {
      userTag(_, args) {
        return UserTag.find();
      },
    },
  };
  
  module.exports = UserTagResolvers;