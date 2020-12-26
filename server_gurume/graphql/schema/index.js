const { gql } = require('apollo-server');

const typedefs =gql`
type Query {
  admin: [adminTb]
  adminTags: [adminTagTb]
  attraction: [attractionTb]
  attractionInfo: [attractionInfo]
  attractionCrawling: [attractionCrawlingTb]
  shareFlow: [shareFlowTb]
  localShareFlow(regionTag: String): [shareFlowTb]
  user(regionTag: String): [userTb]
  selectFlow(_id: ID): [userTb]
  selectUserTb(_id: ID): [selectUserTb]
  folders(_id: ID): folder
  userTag: [userTagTb]
  ytbChannel(regionTag: String): [ytbChannelTb]
  localChannel(regionTag: String) : [ytbChannelTb]
  localVideo(regionTag: String): [video]
  ytbCrawling: [ytbCrawlingTb]
  ytbReq(_id: ID): [ytbReqTb]
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
    adminTag: AdminTags
  }

  type AdminTags {
    seasonTag: [String]
    regionTag: [String]
  }

  type attractionTb {
    _id: ID
    attractionInfo: attractionInfo
    regionTag: String
  }

  type attractionInfo {
    attractionName: String
    attractionAddress: String
    attractionPhoto: String
    location: location
    typeStore: String
  }

  type location {
    lat: Float
    lng: Float
  }


  type attractionCrawlingTb {
    _id: ID
    attractionInfo: attractionInfo
    status: String
  }

  type shareFlowTb {
    _id: ID
    userTbId: userTb
    userId: String
    shareTitle: String
    shareThumbnail: String
    folderTitle: String
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
    folders: [folder]
  }

  type selectUserTb {
    _id: ID
    userId: String
    password: String
    nickname: String
    memo: String
    folders(_id: ID): [selectFolder]
  }

  type folder {
    _id: ID
    folderTitle: String
    createDate: String
    updateDate: String
    stores: [store]
  }

  type selectFolder {
    _id: ID
    folderTitle: String
    createDate: String
    updateDate: String
    stores: [store]
  }

  type store {
    _id: ID
    ytbStoreTbId: ytbStoreTb
    typeStore: String
  }

  type userTagTb {
    _id: ID
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
    video(regionTag: String): [localVideo]
  }
  
  type video {
    _id: ID
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId: ytbStoreTb
    storeId: String
    hits: String
    more: [String]
    uploadDate: String
  }
  type localVideo {
    _id: ID
    ytbVideoName: String
    ytbThumbnail: String
    ytbAddress: String
    ytbStoreTbId(regionTag: String): ytbStoreTb
    storeId: String
    hits: String
    more: [String]
    uploadDate: String
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
    location: location
    typeStore: String
  }

  type ytbReqTb {
    _id: ID
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: Int
    ytbHits: Int
    userTbId: userTb
    userId: String
  }

  type ytbStoreTb {
    _id: ID
    storeInfo: storeInfo
    regionTag: String
  }

  input AdminTbInput {
    userId: String
    password: String
    nickname: String
  }
  input userIdinput {
    ytbReqId: String
    userId: String
  }
  input ShareFlowInput{
    userTbId: ID
    userId: String
    shareTitle: String
    shareThumbnail: String
    userFlowTbId: ID
    folderTitle: String
    adminTagTbId: ID
    adminTag : AdminTagInput
    userTags: [String]
  }
  input AdminTagInput{
    seasonTag: String
    regionTag: String
  }

  type Mutation {
    createAdmin(adminTbInput: AdminTbInput): adminTb!
    createShareFlow(shareFlowInput: ShareFlowInput): shareFlowTb

    createYtbStore(storeId: String, videoId: ID, ytbChannelId: ID): ytbChannelTb
    addUserTb(userIdinput: userIdinput): ytbReqTb!
  }

`;

module.exports = typedefs;


