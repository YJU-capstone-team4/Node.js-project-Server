const { gql } = require('apollo-server');

const typedefs =gql`
type Query {
    admin: [adminTb]
    adminTags: [adminTagTb]
    attraction: [attractionTb]
    attractionInfo: [attractionInfo]
    location: [location]
    attractionCrawling: [attractionCrawlingTb]
    shareFlow: [shareFlowTb]
    localShareFlow(regionTag: String): [shareFlowTb]
    user: [userTb]
    userFlow: [userFlowTb]
    folders: [folder]
    stores: [store]
    userTag: [userTagTb]
    ytbChannel: [ytbChannelTb]
    localChannel(ytbStoreTbId: ID): [localYtbChannelTb]
    video: [video]
    localVideo: [video]
    ytbCrawling: [ytbCrawlingTb]
    storeInfo: [storeInfo]
    ytbReq: [ytbReqTb]
    ytbStore: [ytbStoreTb]
    localYtbStore(regionTag: String): [ytbStoreTb]
    adminTag: [adminTag]
  }

type adminTb {
  _id: ID
  userId: String
  password: String
  nickname: String
}
  
  type adminTagTb {
    _id: ID
    adminTag: adminTags
  }

  type adminTags {
    seasonTags: [String]
    regionTags: [String]
  }

  type attractionTb {
    _id: ID
    attractionInfo: [attractionInfo]
    adminTagTbId: ID
    regionTag: String
  }
  type attractionInfo {
    attractionName: String
    attractionAddress: String
    attractionPhoto: String
    location: [location]
    typeStore: String
  }

  type location {
    lat: Int
    lng: Int
  }


  type attractionCrawlingTb {
    _id: ID
    attractionInfo: [attractionInfo]
    status: String
  }

  type shareFlowTb {
    _id: ID
    userTbId: ID
    userId: String
    shareTitle: String
    shareThumbnail: String
    userFlowTbId: ID
    folderTitle: String
    adminTagTbId: ID
    adminTag : adminTag
    userTags: [String]
    shareDate: String
    updateDate: String
    likeUp: Int
    hits: Int
  }

  type adminTag {
    seasonTag: String
    regionTag: String
  }

  type userTb {
    _id: ID
    userId: String
    password: String
    nickname: String
    memo: String
  }

  type userFlowTb {
    _id: ID
    userTbId: ID
    userId: String
    folders: [folder]
  }

  type folder {
    _id: ID
    folderTitle: String
    createDate: String
    updateDate: String
    stores: [store]
  }

  type store {
    _id: ID
    attractionTbId: ID
    storeName: String
    ytbStoreTb: ytbStoreTb
    typeStore: String
  }

  type userTagTb {
    _id: ID
    userTag: [userTag]
  }
  type userTag {
    userTag: [String]
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
  type localYtbChannelTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: String
    ytbHits: String
    video(ytbStoreTbId: String): [video]
  }
  type video {
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId: ID
    storeId: ID
    hits: String
    more: String
    uploadDate: String
    regionTag: String
  }

  type ytbCrawlingTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    video: [video]
  }

  type storeInfo {
    storeName: String
    storeAddress: String
    location: [location]
    status: String
  }

  type ytbReqTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: Int
    ytbHits: Int
    userTbId: ID
    userId: String
  }

  type ytbStoreTb {
    _id: ID
    storeInfo: [storeInfo]
    adminTagTbId: ID
    regionTag: String
  }

  input AdminTbInput {
    userId: String
    password: String
    nickname: String
  }

  type Mutation {
    createAdmin(adminTbInput: AdminTbInput): adminTb!
  }

`;

module.exports = typedefs;


