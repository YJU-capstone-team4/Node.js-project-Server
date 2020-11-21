const YtbChannel = require("../../server/model/ytbChannelTb.model");
const { startSession } = require('mongoose');

const YtbChannelResolvers = {
    Query: {
      ytbChannel(_, args) {
        return YtbChannel.find()
        .populate('../../server/model/video.ytbStoreTbId')
        .exec();
      },
      localChannel(_, args) {
        return YtbChannel.find({'video.ytbStoreTbId': args.ytbStoreTbId})
        .select()
        .sort('-ytbSubscribe')
        .populate('../../server/model/video.ytbStoreTbId')
        .exec();
      },
    },
  };
  
  module.exports = YtbChannelResolvers;
