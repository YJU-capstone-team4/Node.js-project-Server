const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userTbSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {type: String},
  password: {type: String},
  nickname: {type: String},
  memo: { type:String, default: '' }
}, {
  versionKey: false,
  collection: "userTb"
});

const UserTb = mongoose.model('userTb', userTbSchema);

// mongoose.model('스키마 이름','스키마 객체')
// 데이터베이스는 스키마 이름을 정해주면 이 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만듭니다.

module.exports = UserTb;