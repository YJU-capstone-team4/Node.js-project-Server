const { Subschema } = require('graphql-tools');
const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const userFlowTbSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'userTb' },
  userId: {type: String},
  folders: [
    {
      folderTitle: {type: String},
      createDate: {type: Date},
      updateDate: {type: Date},
      stores: [
        {
        //  ytbStoreTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'ytbStoreTb' },
          ytbStoreTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'ytbStoreTb' },
          attractionTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'attractionTb' },
          storeId: {type: String},
          typeStore: {type: String}
        }
      ]
    }
  ]
}, {
  versionKey: false,
  collection: "userFlowTb"
});

const UserFlowTb = mongoose.model('userFlowTb', userFlowTbSchema);

// mongoose.model('스키마 이름','스키마 객체')
// 데이터베이스는 스키마 이름을 정해주면 이 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만듭니다.

module.exports = UserFlowTb;