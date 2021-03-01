/* 더보기란 '-'제외한 특수문자 제거 + 공백 제거한 배열 */
exports.regMore = (argMoreArray, argMore) => {
    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\_+<>@\#$%&\\\=\(\'\"]/gi   /* '-' 제외한 특수문자 제거 */
    argMoreArray = argMoreArray.map(e => e.replace(regExp, ' '))    /* 더보기란 배열 요소 특수문자 제거 */
    argMoreArray = argMoreArray.join(' ').split(' ')
    argMoreArray = argMoreArray.filter((e) => { return e !== '' })  /* 더보기란 배열 공백 제거 */
    return argMoreArray
}

/*
let viewMoreArray = text.split('\n')                                  // 더보기란 줄바꿈 기준 배열로 쪼개기 
const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\_+<>@\#$%&\\\=\(\'\"]/gi     // '-' 제외한 특수문자 제거 
viewMoreArray = viewMoreArray.map(e => e.replace(regExp, ' '))        // 더보기란 배열 요소 특수문자 제거 
viewMoreArray = viewMoreArray.join(' ').split(' ')
viewMoreArray = viewMoreArray.filter((e) => {                         // 더보기란 배열 공백 제거 
    return e !== ''
})
*/