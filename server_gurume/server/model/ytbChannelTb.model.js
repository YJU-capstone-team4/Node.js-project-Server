const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ytbChannelTbSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ytbChannel: {type: String},
  ytbProfile: {type: String},
  ytbLinkAddress: {type: String},
  ytbSubscribe: {type: String},
  ytbHits: {type: String},
  video: [
    {
      ytbVideoName: {type: String},
      ytbThumbnail:{type: String},
      ytbAddress: {type: String},
      ytbStoreTb: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ytbStoreTb' }],
      storeId: {type: String},
      hits: {type: String},
      uploadDate: {type: Date}
    }
  ]
}, {
  versionKey: false,
  collection: "ytbChannelTb"
});

const YtbChannelTb = mongoose.model('ytbChannelTb', ytbChannelTbSchema);

// mongoose.model('스키마 이름','스키마 객체')
// 데이터베이스는 스키마 이름을 정해주면 이 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만듭니다.

module.exports = YtbChannelTb;