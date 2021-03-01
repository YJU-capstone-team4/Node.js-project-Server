var mecab = require('mecab-ya');

/* mecab 주소 형태소 결과 반환 */
exports.rawAddr = (argViewMore) => {
    return new Promise( (resolve, reject) => {
        mecab.address(argViewMore, function(err, result) {
            if (err) reject(err)
            resolve(result)
        })
    })
}

/* mecab 명사 반환 */
exports.rawNouns = (argViewMore) => {
    return new Promise( (resolve, reject) => {
        mecab.nouns(argViewMore, function(err, result) {
            if (err) reject(err)
            resolve(result)
        })
    })
}