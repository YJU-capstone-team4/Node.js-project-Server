const YtbChannel = require("../../server/model/ytbChannelTb.model");
const YtbStore = require("../../server/model/ytbStoreTb.model");
const { startSession } = require('mongoose');
const { where, exists, populate } = require("../../server/model/ytbStoreTb.model");
const { json } = require("express");

const YtbChannelResolver = {

    Query: {
      ytbChannel(_, args) {
        return YtbChannel.find()
        // .populate({path : '../../server/model/video.ytbStoreTbId',
        // match: { regionTag: args.regionTag }})
        .populate({path : '../../server/model/video.ytbStoreTbId',
        model : 'YtbStore',
        match: {'regionTag': args.regionTag}})
        //.exec()
        .exec(function(err, channels) {
          console.log(args.regionTag)
          console.log(channels.ytbChannel)
          // channels = channels.filter(function(channel) {
          //   console.log(channel.ytbStoreTbId.regionTag);
          //   return channel.ytbStoreTbId.regionTag;
          // })
        })
    //         .then(data => {
    //   console.log(data);
    //   return data;
    // })
    // .catch(err => console.log(err));
       // .exec(function(err, ytbStore) {
        //   ytbStore.filter(function())
        // });
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
              model : 'YtbStore',
              match: {'video.ytbStoreTbId.regionTag': args.regionTag}})
    .exec(function(err, channels) {
      console.log(args.regionTag)
      console.log(channels.ytbChannel)
      // channels = channels.filter(function(channel) {
      //   console.log(channel.ytbStoreTbId.regionTag);
      //   return channel.ytbStoreTbId.regionTag;
      // })
    })

    // .then(data => {
    //   console.log(data);
    //   return data;
    // })
    // .catch(err => console.log(err));
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
  // .where('regionTag')
  // .equals(_.args.regionTag)

  return store.regionTag;
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
