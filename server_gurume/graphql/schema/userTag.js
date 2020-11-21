const { gql } = require('apollo-server');
// 쿼리문만 작성
const userTagTypeDefs = gql`
  type Query {
    userTag: [userTagTb]
  }

  type userTagTb {
    _id: ID
    userTag: [userTag]
  }
  
  input UserTagInput {
    userTag: [String]
  }

  type Mutation{
    createUserTag(userTagInput: UserTagInput): userTag!
    updateUserTag(userTagInput: UserTagInput): userTag!
  }
`;
module.exports = userTagTypeDefs;