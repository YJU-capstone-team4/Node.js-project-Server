const { gql } = require('apollo-server');
// 쿼리문만 작성
const userTypeDefs = gql`
  type Query {
    user: [userTb]
  }

  type userTb {
    _id: ID
    userId: String
    password: String
    nickname: String
    memo: String
  }

  input UserTbInput {
    userId: String
    password: String
    nickname: String
    memo: String
  }

  type Mutation{
    createUserTb(userTbInput: UserTbInput): userTb!
    updateUserTb(userTbInput: UserTbInput): userTb!
  }
`;
module.exports = userTypeDefs;