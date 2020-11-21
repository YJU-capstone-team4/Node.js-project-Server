const { gql } = require('apollo-server');
// 쿼리문만 작성
const shareFlowTypeDefs = gql`
  type Query {
    shareFlow: [shareFlowTb]
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
    adminTag: [adminTag]
    userTags: [String]
    shareDate: String
    updateDate: String
    likeUp: Int
    hits: Int
  }

  type adminTag {
    seasonTags: String
    regionTags: String
  }

  input ShareFlowInput {
    userTbId: ID
    userId: String
    shareTitle: String
    shareThumbnail: String
    userFlowTbId: ID
    folderTitle: String
    adminTagTbId: ID
    shareDate: String
    updateDate: String
    likeUp: Int
    hits: Int
  }

  input AdminTagInput {
    seasonTags: String
    regionTags: String
  }

  type Mutation{
    createShareFlow(shareFlowInput: ShareFlowInput): shareFlowTb!
    createAdminTag(adminTagInput: AdminTagInput): adminTag!
    updateShareFlow(shareFlowInput: ShareFlowInput): shareFlowTb!
    updateAdminTag(adminTagInput: AdminTagInput): adminTag!
  }
`;
module.exports = shareFlowTypeDefs;