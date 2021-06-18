const { adminNaverMap } = require('./util/getAdminStore')
const { adminGoogleMap } = require('./util/getAdminStore')
const { adminKakaoMap } = require('./util/getAdminStore')

// const place = 'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄹ'
// const place = '대구 서구 내당동 내당칼국수'

exports.adminStore = async(argSearchPlace) => {
    try{
        const searchPlace = argSearchPlace /* 수집할 장소 */

        let naverPromise = new Promise((resolve, reject) => {
            let naver = adminNaverMap(searchPlace)
            resolve(naver)
        })
        let googlePromise = new Promise((resolve, reject) => {
            let google = adminGoogleMap(searchPlace)
            resolve(google)
        })
        let kakaoPromise = new Promise((resolve, reject) => {
            let kakao = adminKakaoMap(searchPlace)
            resolve(kakao)
        })

        /* 비동기 처리 */
        const adminResult = await Promise.all([naverPromise, googlePromise, kakaoPromise]).then((value) => { return value })

        console.log('3사 주소 검색 결과 :\n', adminResult)

        return adminResult
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        process.exit()
    }
}
// adminStore(place)