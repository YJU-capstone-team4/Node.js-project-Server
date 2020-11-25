const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ytbCrawlingTbSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ytbChannel: {type: String},
  ytbProfile: {type: String},
  videoCount: {type: Number},
  video: [
    {
      ytbVideoName: {type: String},
      ytbThumbnail: {type: String},
      ytbAddress: {type: String},
      hits: {type: Number},
      uploadDate: {type: Date},
      more: {type: String},
      storeInfo: {
        storeName: {type: String},
        storeAddress: {type: String},
        location: {
          lat: {type: Number},
          lng: {type: Number},
        }
      },
      status: {type: String}
    }
  ]
}, {
  versionKey: false,
  collection: "ytbCrawlingTb"
});

const YtbCrawlingTb = mongoose.model('ytbCrawlingTb', ytbCrawlingTbSchema);

// mongoose.model('스키마 이름','스키마 객체')
// 데이터베이스는 스키마 이름을 정해주면 이 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만듭니다.

module.exports = YtbCrawlingTb;