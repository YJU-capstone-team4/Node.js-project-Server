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
    lat: Int
    lng: Int
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
    lat: Int
    lng: Int
  }

  type Mutation{
    createAttraction(attractionInput: AttractionInput): attractionCrawlingTb!
    createAttractionInfo(attractionInfoInput: AttractionInfoInput): attractionInfo!
    createLocation(locationInput: LocationInput): location!
    updateAttraction(attractionInput: AttractionInput): attractionCrawlingTb!
    updateAttractionInfo(attractionInfoInput: AttractionInfoInput): attractionInfo!
    updateLocation(locationInput: LocationInput): location!
  }
`;
module.exports = attractionCrawlingTypeDefs;