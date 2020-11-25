const Attraction = require("../../server/model/attractionTb.model");
const AdminTag = require("../../server/model/adminTagTb.model");
const { startSession } = require('mongoose');

const AttractionResolvers = {
    Query: {
      attraction(_, args) {
        return Attraction.find()
        .populate('../../server/model/adminTagTbId')
        .exec();
      },
    },
    attractionTb : {
      async adminTagTbId(_, args) {
        const adminTag = await AdminTag.findById(_.adminTagTbId._id);
        return adminTag;
      },
  },
  };
  
  module.exports = AttractionResolvers;