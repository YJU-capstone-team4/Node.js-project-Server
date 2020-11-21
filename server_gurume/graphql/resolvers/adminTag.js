const AdminTag = require("../../server/model/adminTagTb.model");
const { startSession } = require('mongoose');

const AdminTagResolvers = {
    // Query: {
    //   adminTags(_, args) {
    //     return AdminTag.find().populate('adminTag').exec();
    //   },
    // },

};
  
  module.exports = AdminTagResolvers;