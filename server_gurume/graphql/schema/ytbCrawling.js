const { gql } = require('apollo-server');
// 쿼리문만 작성
const ytbChannelTypeDefs = gql`
  type Query {
    ytbCrawling: [ytbCrawlingTb]
  }

  type ytbCrawlingTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    video: [video]
  }

  type video {
    _id: ID
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    hits: Int
    uploadDate: date
    more: String
    storeInfo: [storeInfo]
  }

  type storeInfo {
    storeName: String
    storeAddress: String
    location: [location]
    status: String
  }

  type location {
    lat: int
    lng: int
  }

  input YtbCrawlingTbInput {
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
    hits: Int
    uploadDate: date
    more: String
  }

  input StoreInfoInput {
    storeName: String
    storeAddress: String
    status: String
  }
  
  input LocationInput {
    lat: int
    lng: int
  }

  type Mutation{
    createChannel(ytbCrawlingTbInput: YtbCrawlingTbInput): ytbCrawlingTb!
    createVideo(videoInput: VideoInput): video!
    createStoreInfo(StoreInfoInput: StoreInfoInput): storeInfo!
    createLocation(locationInput: LocationInput): location!
  }
`;
module.exports = ytbChannelTypeDefs;