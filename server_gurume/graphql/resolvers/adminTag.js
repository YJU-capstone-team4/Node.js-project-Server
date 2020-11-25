const AdminTag = require("../../server/model/adminTagTb.model");
const { startSession } = require('mongoose');

const AdminTagResolvers = {
    Query: {
      adminTags(_, args) {
        return AdminTag.find();
      },
    },

};
  
  module.exports = AdminTagResolvers;