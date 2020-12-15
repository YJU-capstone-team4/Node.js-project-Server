const YtbChannel = require("../../server/model/ytbChannelTb.model");
const YtbStore = require("../../server/model/ytbStoreTb.model");
const { startSession } = require('mongoose');
const { where, exists, populate } = require("../../server/model/ytbStoreTb.model");
const { json } = require("express");

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
    return YtbChannel.find({
      //'video.ytbStoreId.regionTag': args.regionTag
    })
    .sort('-ytbSubscribe')
    .populate({path : '../../server/model/video.ytbStoreTbId',
              match: {'regionTag': args.regionTag}  
  })
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => console.log(err));
  },
},

    video: {
      async ytbStoreTbId(_, args) {
        const ytbStore = await YtbStore.findById(_.ytbStoreTbId);
        return ytbStore;
      },
    },
    localVideo: {
      async ytbStoreTbId(_, args) {
        const store = await YtbStore.findById(_.ytbStoreTbId)
        // .where('regionTag')
        // .equals(args.regionTag)
        return store;
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

          // .where(video.ytbStoreTbId(regionTag))
        // .equals(args.regionTag)
