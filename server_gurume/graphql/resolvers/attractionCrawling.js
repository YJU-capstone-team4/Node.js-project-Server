const AttractionCrawling = require("../../server/model/attractionCrawlingTb.model");
const { startSession } = require('mongoose');

const AttractionCrawlingResolvers = {
    Query: {
      attractionCrawling(_, args) {
        return AttractionCrawling.find();
      },
    },

  };
  
  module.exports = AttractionCrawlingResolvers;