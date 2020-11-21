const { gql } = require('apollo-server');
// 쿼리문만 작성
const ytbChannelTypeDefs = gql`
  type Query {
    ytbReq: [ytbReqTb]
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

  input YtbReqTbInput {
    ytbChannel: String
    ytbProfile: String
    ytbLinkAddress: String
    ytbSubscribe: Int
    ytbHits: Int
  }

  type Mutation{
    createytbReqTb(ytbReqTbInput: YtbReqTbInput): ytbReqTb!
    updateytbReqTb(ytbReqTbInput: YtbReqTbInput): ytbReqTb!
  }
`;
module.exports = ytbChannelTypeDefs;