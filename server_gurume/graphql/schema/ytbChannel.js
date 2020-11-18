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
    ytbSubscribe: Int
    ytbHits: Int
    video: [video]
  }

  type video {
    _id: ID
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId: ID
    storeId: Int
    hits: Int
    uploadDate: date
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
  }
`;
module.exports = ytbChannelTypeDefs;