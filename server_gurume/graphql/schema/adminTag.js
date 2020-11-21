const { gql } = require('apollo-server');
// 쿼리문만 작성
const adminTagTypeDefs = gql`
  type Query {
    adminTags: [adminTagTb]
    adminTag(id: ID!): adminTagTb
  }

  type adminTagTb {
    _id: ID
    adminTag: [adminTag]
  }

  type adminTag {
    seasonTags: [String]
    regionTags: [String]
  }

  input AdminTagInput {
    seasonTags: [String]
    regionTags: [String]
  }

  type Mutation{
    createAdminTag(adminTagInput: AdminTagInput): adminTag!
    updateAdminTag(adminTagInput: AdminTagInput): adminTag!
  }
`;
module.exports = adminTagTypeDefs;