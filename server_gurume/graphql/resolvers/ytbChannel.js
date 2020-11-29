const YtbChannel = require("../../server/model/ytbChannelTb.model");
const AdminTag = require("../../server/model/adminTagTb.model");
const YtbStore = require("../../server/model/ytbStoreTb.model");
const { startSession } = require('mongoose');
const { where, exists, populate } = require("../../server/model/ytbStoreTb.model");

const YtbChannelResolver = {

    Query: {
      ytbChannel(_, args) {
        return YtbChannel.find()
        .populate('../../server/model/video.ytbStoreTbId')
        .exec();
      },
      // localChannel(_, args) {
      //   return YtbChannel.find({'localVideo.ytbStoreTbId.regionTag' : args.regionTag})

      //   .select()
      //   .sort('-ytbSubscribe')
      //   .populate('../../server/model/video.ytbStoreTbId')
      //   .exec();
      // },
     localChannel(_, args) {
        return YtbChannel.find()
        .select()
        .sort('-ytbSubscribe')
        .populate({
          path: '../../server/model/video.ytbStoreTbId',
          populate: {path : '../../server/model/adminTagTbId'}})
        // .where('video.ytbStoreTbId.regionTag')
        // .equals(args.regionTag)
        .exec();
      },
    },

    video: {
        async ytbStoreTbId(_, args) {
          const store = await YtbStore.findById(_.ytbStoreTbId._id);
          return store;
      },
    },
    localVideo: {
      async ytbStoreTbId(_, args) {
        const store = await YtbStore.findById(_.ytbStoreTbId._id)
        .where('regionTag')
        .equals(args.regionTag)
        return store;
    },
  },
    ytbStoreTb: {
      async adminTagTbId(_, args) {
        const adminTag = await AdminTag.findById(_.adminTagTbId._id);
        return adminTag;
      },
  }, 
    Mutation: {
      // createYtbStore: async(_, {storeId, videoId, ytbChannelId}) => {
      //   try {
      //     var ytbChannels = await YtbChannel.findById(ytbChannelId);
      //     ytbChannels = await ytbChannels.find({"video_id": videoId});
      //     await ytbChannels.ytbStoreTb.push(storeId);
      //     const savedYtbChannel = await ytbChannels.save();
      //     return savedYtbChannel;
      //   }catch (error) {
      //     throw new Error(error);
      //   }
      // },
    }
  };
  
  module.exports = YtbChannelResolver;
