const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shareFlowTbSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'userTb' },
  userId: {type: String},
  shareTitle: {type: String},
  shareThumbnail: {type: String},
  userFlowTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'userFlowTb' },
  folderTitle: {type: String},
  adminTagTbId: { type: mongoose.Schema.Types.ObjectId, ref: 'adminTagTb',
                    default: "5fb0dd00760c862f24a3d4c2", required: true },
  adminTag: {
    seasonTag: {type: String},
    regionTag: {type: String},
  },
  userTags: {type: Array},
  shareDate: {type: Date},
  updateDate: {type: Date},
  likeUp: {type: Number},
  hits: {type: Number}
}, {
  versionKey: false,
  collection: "shareFlowTb"
});

const ShareFlowTb = mongoose.model('shareFlowTb', shareFlowTbSchema);

// mongoose.model('스키마 이름','스키마 객체')
// 데이터베이스는 스키마 이름을 정해주면 이 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만듭니다.

module.exports = ShareFlowTb;