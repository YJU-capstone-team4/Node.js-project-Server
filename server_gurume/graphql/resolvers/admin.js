const Admin = require("../../server/model/adminTb.model");
const { startSession } = require('mongoose');

const AdminResolvers = {
  Query: {
      admin(_, args) {
        return Admin.find();
      },
    },
  Mutation: {
    async createAdmin(_, args) {
      try {
        const admin = new Admin({
          ...args.adminTbInput
        })
        const result = await admin.save()
        return result
      } catch (e) {
        console.log(e)
        throw e
      }
    },
  }

};
  
  module.exports = AdminResolvers;