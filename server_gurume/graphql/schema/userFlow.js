const { gql } = require('apollo-server');
// 쿼리문만 작성
const userFlowTypeDefs = gql`
  type Query {
    userFlow: [userFlowTb]
  }

  type userFlowTb {
    _id: ID
    userTbId: ID
    userId: String
    folders: [folder]
  }

  type folder {
    _id: ID
    folderTitle: String
    createDate: DateTime
    updateDate: DateTime
    stores: [store]
  }
  
  type store {
    _id: ID
    ytbStoreTbId: ID
    storeId: String
    typeStore: String
  }

  input UserFlowTbInput {
    userTbId: ID
    userId: String
  }

  input FolderInput {
    folderTitle: String
    createDate: DateTime
    updateDate: DateTime
  }

  input StoreInput {
    ytbStoreTbId: ID
    storeId: String
    typeStore: String
  }

  type Mutation{
    createUserFlowTb(userFlowTbInput: UserFlowTbInput): userFlowTb!
    createFolder(folderInput: FolderInput): folder!
    createStore(storeInput: StoreInput): store!
  }
`;
module.exports = userFlowTypeDefs;