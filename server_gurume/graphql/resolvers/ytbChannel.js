const YtbChannel = require("../../server/model/ytbChannelTb.model");
const { startSession } = require('mongoose');

const YtbChannelResolvers = {
    Query: {
      // ytbChannel(_, args) {
      //   return YtbChannel.find()
      //   .populate('../../server/model/video.ytbStoreTbId')
      // //   .populate({
      // //     path: '../../server/model/folders.stores.ytbStoreTbId',
      // //     populate: { path: '../../server/model/adminTagTbId' }
      // // })
      //   .exec();
      // },
      ytbChannel: async () => {
        try {
          const ytbChannels = await YtbChannel.find()
          return ytbChannels;
        }catch (error) {
          throw new Error(error);
        }
      },
      localChannel(_, args) {
        return YtbChannel.find({'video.ytbStoreTbId': args.ytbStoreTbId})
        .select()
        .sort('-ytbSubscribe')
        .populate({
          path: '../../server/model/folders.stores.ytbStoreTbId',
          populate: { path: '../../server/model/adminTagTbId' }
      })
        .exec();
      },
    },
    ytbChannelTb:  {
      video: {
        ytbStoreTb: async (ytbChannelTb) => {
          return (await 
            ytbChannelTb.video.populate('../../server/model/video.ytbStoreTb.model')
            .execPopulate())
            .ytbStore;
        },
      }
    }
  };
  
  module.exports = YtbChannelResolvers;
