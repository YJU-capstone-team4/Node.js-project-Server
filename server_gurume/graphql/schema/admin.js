const { gql } = require('apollo-server');
// 쿼리문만 작성
const adminTypeDefs = gql`
  type Query {
    admins: [adminTb]
    admin(_id: ID!): [adminTb]
  }

  type adminTb {
    _id: ID
    userId: String
    password: String
    nickname: String
  }

  input AdminInput {
    userId: String
    password: String
    nickname: String
  }

  type Mutation{
    createAdmin(adminInput: AdminInput): adminTb!
    updateAdmin(adminInput: AdminInput): adminTb!
  }
`;
module.exports = adminTypeDefs;