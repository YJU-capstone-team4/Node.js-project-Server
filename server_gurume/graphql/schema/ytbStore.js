const { gql } = require('apollo-server');
// 쿼리문만 작성
const ytbStoreTypeDefs = gql`
  type Query {
    ytbStore: [ytbStoreTb]
  }

  type ytbStoreTb {
    _id: ID
    storeInfo: [storeInfo]
    adminTagTbId: ID
    regionTag: String
  }

  type storeInfo {
    storName: String
    storeAddress: String
    location: [location]
    typeStore: String
  }

  type location {
    lat: int
    lng: int
  }

  input YtbStoreTbInput {
    adminTagTbId: ID
    regionTag: String
  }

  input StoreInfoTbInput {
    storName: String
    storeAddress: String
    typeStore: String
  }

  input LocationInput {
    lat: int
    lng: int
  }

  type Mutation{
    createYtbStoreTb(ytbStoreTbInput: YtbStoreTbInput): ytbStoreTb!
    createStoreInfoTb(storeInfoTbInput: StoreInfoTbInput): storeInfo!
    createLocation(locationInput: LocationInput): location!
  }
`;
module.exports = ytbStoreTypeDefs;