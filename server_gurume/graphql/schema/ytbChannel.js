const { gql } = require('apollo-server');
const ytbChannelTypeDefs = gql`
  type Query {
    ytbChannel: [ytbChannelTb]
  }

  type ytbChannelTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: String
    ytbHits: String
    video: [video]
  }

  type video {
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId: ID
    storeId: String
    hits: String
    uploadDate: String
  }

  input YtbChannelInput {
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: Int
    ytbHits: Int
  }

  input VideoInput {
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId: ID
    storeId: Int
    hits: Int
    uploadDate: date
  }

  type Mutation{
    createYtbChannel(ytbchannelInput: YtbChannelInput): ytbChannelTb!
    createVideo(videoInput: VideoInput): video!
    updateYtbChannel(ytbchannelInput: YtbChannelInput): ytbChannelTb!
    updateVideo(videoInput: VideoInput): video!
  }
`;
module.exports = ytbChannelTypeDefs;