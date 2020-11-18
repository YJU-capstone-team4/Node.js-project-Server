const { gql } = require('apollo-server');
// 쿼리문만 작성
const attractionTypeDefs = gql`
  type Query {
    attraction: [attractionTb]
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
    lat: int
    lng: int
  }

  input AttractionInput {
    adminTagTbId: ID
    regionTag: String
  }

  input AttractionInfoInput {
    attractionName: String
    attractionAddress: String
    attractionPhoto: String
    typeStore: String
  }

  input LocationInput {
    lat: int
    lng: int
  }


  type Mutation{
    createAttraction(attractionInput: AttractionInput): attractionTb!
    createAttractionInfo(attractionInfoInput: AttractionInfoInput): attractionInfo!
    createLocation(locationInput: LocationInput): location!
  }
`;
module.exports = attractionTypeDefs;