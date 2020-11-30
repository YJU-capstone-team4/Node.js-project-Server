const Attraction = require("../../server/model/attractionTb.model");
const { startSession } = require('mongoose');

const AttractionResolvers = {
    Query: {
      attraction(_, args) {
        return Attraction.find()
        .exec();
      },
    },
  };
  
  module.exports = AttractionResolvers;