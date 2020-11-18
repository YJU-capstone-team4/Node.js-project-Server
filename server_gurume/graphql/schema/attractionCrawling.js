const { gql } = require('apollo-server');
// 쿼리문만 작성
const attractionCrawlingTypeDefs = gql`
  type Query {
    attractionCrawling: [attractionCrawlingTb]
  }

  type attractionCrawlingTb {
    _id: ID
    attractionInfo: [attractionInfo]
    status: String
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
    status: String
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
    createAttraction(attractionInput: AttractionInput): attractionCrawlingTb!
    createAttractionInfo(attractionInfoInput: AttractionInfoInput): attractionInfo!
    createLocation(locationInput: LocationInput): location!
  }
`;
module.exports = attractionCrawlingTypeDefs;