// schema 파일들 다 import 해서 export 하기
const admin = require('./admin') ;
const adminTag = require('./adminTag');
const attraction = require('./attraction');
const attrationCrawling = require('./attractionCrawling');
const shareFlow = require('./shareFlow');
const user = require('./user');
const userFlow = require('./userFlow');
const userTag = require('./userTag');
const ytbChannel = require('./ytbChannel');
const ytbCrawling = require('./ytbCrawling');
const ytbReq = require('./ytbReq');
const ytbStore = require('./ytbStore');

const schemas = {
    ...admin, 
    ...adminTag, 
    ...attraction, 
    ...attrationCrawling, 
    ...shareFlow, 
    ...user, 
    ...userFlow, 
    ...userTag, 
    ...ytbChannel, 
    ...ytbCrawling, 
    ...ytbReq, 
    ...ytbStore
}

module.exports = schemas;


