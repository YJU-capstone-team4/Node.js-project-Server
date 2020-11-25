const YtbChannel = require("../../server/model/ytbChannelTb.model");
//const YtbStore = require("../../server/model/ytbStoreTb.model");
const { startSession } = require('mongoose');

const YtbChannelResolver = {

    Query: {
      ytbChannel(_, args) {
        return YtbChannel.find()

        //.populate('../../server/model/ytbStoreTb')
        //.populate('../../server/model/ytbChannelTb.video.ytbStoreTbId')
        .populate('../../server/model/video.ytbStoreTb')
        .exec();
      }

      // localChannel(_, args) {
      //   return YtbChannel.find({'video.ytbStoreTbId': args.ytbStoreTbId})
      //   .select()
      //   .sort('-ytbSubscribe')
      //   .populate({
      //     path: '../../server/model/folders.stores.ytbStoreTbId',
      //     populate: { path: '../../server/model/adminTagTbId' }
      // })
      //   .exec();
      // },
      // ytbChannel: async () => {
      //   try {
      //     const ytbChannels = await YtbChannel.find()
      //     return ytbChannels;
      //   }catch (error) {
      //     throw new Error(error);
      //   }
      // },
    },
    // ytbChannelTb:  {
    //   video: [{
    //     async ytbStoreTbId(_, args) {
    //       const store = await YtbStore.find({"ytbStoreId_id" : _.video.ytbStoreId._id});
    //       return store;
    //     }
    //   }]

  //  },
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
