const { rawAddr } = require('./util/addrMecab')
const { getNaverStoreInfo } = require('./util/naverMap') 
const { regMore } = require('./util/regMore') 
const { getGoogleLocation } = require('./util/getLocation')

// const viewMore = `#보슬보슬​
// #키토김밥​
// #밥없는김밥​
// #차돌마늘떡볶이​

// 구독하기(Subscribe) 좋아요(Like) 고맙습니다!(Thank you!)

// 노랑빛깔 밥없는 김밥 6줄..차돌마늘떡볶이에 찍어묵자!!
// 야식이 먹방

// 2021년 2월 24일 서울시 강남구 역삼동 824-29 '보슬보슬'

// 각국어 번역 자막 제작 : 
// 컨텐츠 제작의 마무리는 컨텐츠플라이! 글로벌 진출을 위한 최고의 파트너
// CONTENTSFLY에서 제작되었습니다.
// https://www.contentsfly.com`

/* { 가게이름, 가게주소, typeStore:'맛집' } */
exports.getStoreInfo = async (argViewMore) => {
    try {
        let text = argViewMore // 더보기란

        const rawAddrArray = await rawAddr(text) /* 주소 형태소 분석 결과 배열 */

        if (rawAddrArray == '') { 
            /* 더보기란에 주소가 없을 경우 false return */
            console.log('[더보기란] 가게 주소 x') 
            console.log('수집 제외')

            return false
        } 
        else {
            let viewMoreArray = text.split('\n')         /* 더보기란 줄바꿈 기준 배열로 쪼개기 */ 
            viewMoreArray = await regMore(viewMoreArray) /* 더보기란 '-'제외한 특수문자 제거 + 공백 제거한 배열 */

            // console.log('주소 형태소 분석 결과 :', rawAddrArray, '\n')

            const regNum = /[0-9]/ /* 정규식 -> 숫자 */

            const checkBunjiAddr = /읍$|면$|동$|리$|대로$|로$|길$/g  /* 정규식 -> '읍.면.동.리'로 끝나는 문자 */
            let endBunjiAddr /* 주소 형태소 분석 결과 배열 -> '읍.면.동.리'로 끝나는 요소 */
            
            /* 주소 형태소 분석 결과 배열에서 '읍.면.동.리'(지번주소)로 끝나는 요소 검사 */
            for (e of rawAddrArray) {
                if(e.match(checkBunjiAddr)) {
                    endBunjiAddr = e
                }
            }

            // 주소 형태소 분석 결과 마지막 요소의 단어가 더보기란 배열 요소에 포함 되어있을 경우 해당 요소를 return -> 읍면동리로 끝나는 놈임
            const findBunjiIndex = viewMoreArray.indexOf(endBunjiAddr)      /* '읍.면.동.리' 요소 인덱스 */
            const bunjiAddr = viewMoreArray[findBunjiIndex]                 /* '읍.면.동.리' 요소 */
            const bunjiNum = viewMoreArray[findBunjiIndex+1]                /* '읍.면.동.리' 다음 요소 (번지수) */
            const bunjiNumIndex = viewMoreArray.indexOf(bunjiNum)           /* (번지수) 요소 인덱스 */       


            let detailAddr      /* 지번 상세 주소 */
            let viewMoreAddr    /* 지번 상세 주소 배열 */
            let addrJoin        /* 지번 상세 주소 문자열 */

            if(regNum.test(bunjiNum)) {
                /* '읍.면.동.리'다음 요소에 숫자가 포함된 경우 (번지수가 있는 경우) */
                viewMoreAddr = viewMoreArray.slice(bunjiNumIndex-3, bunjiNumIndex+1) /* 더보기란 배열에서 번지 주소 부분만 파싱 */
                // console.log('지번 상세 주소 배열 (번지 수 o)', viewMoreAddr)
                addrJoin = viewMoreAddr.join(' ') /* viewMoreAddr 배열 -> 문자열 */
                // console.log('지번 상세 주소 (번지 수 o) :', addrJoin)

                detailAddr = addrJoin
            } 
            else {
                viewMoreAddr = viewMoreArray.slice(bunjiNumIndex-3, bunjiNumIndex+1) // 가게 주소(번지x) + 가게이름 
                 // console.log('지번 상세 주소 배열 (번지 수 x)', viewMoreAddr)
                addrJoin = viewMoreAddr.join(' ')
                // console.log('지번 상세 주소 (번지 수 x) :', addrJoin)

                detailAddr = addrJoin
            }

            // 네이버 지도 크롤링 
            let storeInfo
            /* 지번 상세 주소가 없을 경우 -> 에러 */
            if (detailAddr == '') {
                console.log('[네이버지도]에 검색할 주소가 없습니다.')
                storeInfo = '에러'
                console.log('[더보기란] 주소 정보 반환(상세주소 x)\n', storeInfo)
                
                return storeInfo
            }

            let mapStoreInfo = await getNaverStoreInfo(detailAddr) /* 네이버 지도 검색 결과 : [{가게이름,가게주소},...] */
    
            if(mapStoreInfo == undefined) {
                storeInfo = '에러'
                console.log('[네이버지도] 검색중 오류 발생\n', storeInfo)

                return storeInfo
            }

            let mapStoreName = mapStoreInfo.map(e => e.storeName) /* 네이버 지도 가게이름 배열 */
            mapStoreName = mapStoreName.join(' ').split(' ')

            /* 네이버 지도 가게이름 배열, 더보기란 배열 요소 비교 -> 가게이름 파싱 */
            let viewMoreStoreName = viewMoreArray.filter((e) => mapStoreName.includes(e))
            viewMoreStoreName = viewMoreStoreName.join()
           
            /* 네이버지도에서 더보기란 가게이름이랑 일치하는 가게가 없을 경우 -> 에러 */
            if(viewMoreStoreName == '') {
                console.log('[네이버지도 / 더보기란] 가게 이름 비교 -> 가게이름 x')
                storeInfo = '에러'
                console.log('더보기란 주소 정보 반환(가게이름 x)\n', storeInfo)

                return storeInfo
            } 
            else {
                console.log('[더보기란] 가게이름 :', viewMoreStoreName)
  
                let naverMapAddr = mapStoreInfo.filter((e) => (e.storeName).includes(viewMoreStoreName))
                // console.log('naverMapAddr', naverMapAddr)
                if(naverMapAddr == '') {
                    console.log('[네이버지도] 가게이름에 해당하는 가게 주소 x')
                    storeInfo = '에러'

                    return storeInfo
                } 
                else {
                    let viewMoreStoreAddr = naverMapAddr[0].storeAddr /* 네이버지도 상세주소 */
                    console.log('[네이버지도] 상세 주소 :', viewMoreStoreAddr,'\n')

                    // [네이버지도] 가게주소 좌표값 획득
                    const naverLocation = await getGoogleLocation(viewMoreStoreAddr)
                    console.log('[구글지도] 좌표값 획득 여부', naverLocation)
                   
                    if(naverLocation == null||undefined||false) {
                        console.log('[네이버지도] 가게 주소 좌표값 x')
                        storeInfo = '에러'
    
                        return storeInfo
                    } else {
                        console.log('[구글지도] 좌표값 획득!!!', naverLocation)
                    
                        storeInfo = { storeName : viewMoreStoreName, storeAddress : viewMoreStoreAddr, typeStore : '맛집', location : naverLocation } // location {lat, lng} 추가 필요
                        console.log('[더보기란] 주소 정보 반환(네이버 o)\n', storeInfo)
                
                        return storeInfo
                    }
                }
            }
        }      
        
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getStoreInfo(viewMore)