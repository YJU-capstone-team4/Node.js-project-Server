const User = require("../../server/model/userTb.model");
const { startSession } = require('mongoose');

const UserResolvers = {
    Query: {
      user(_, args) {
        return User.find();
      },
    },

  };
  
  module.exports = UserResolvers;