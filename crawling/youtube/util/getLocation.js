const puppeteer = require('puppeteer')
const { checkNaverlocation } = require('./checkLocation')

// const place = '서울특별시 영등포구 국회대로68길 23'
// const place = '대전 동구 대전로 695-3 이동왕만두'
// const place = '대구 서구 내당동 내당칼국수' 216-4
// const place = '부산광역시 남구 대연동 수영로 309' // 여러 주소 뜨는 경우
// const place = 'ㅁㄴㅇㄻㄴㅇㄹ'                 // 주소가 아예 없는 경우
// const place = '대구 서구 달구벌대로361길 11'

// Naver Map : Request Url -> 좌표값 획득
exports.getNaverLocation = async(argSearchPlace) => {
    try{
        const browser = await puppeteer.launch({
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,      
        })
        const searchPlace  = argSearchPlace                          /* 수집할 장소 */
        const searchUrl   = 'https://map.naver.com/'                 /* Naver Map URL */
        console.log('[네이버지도 좌표값] 검색할 장소 이름 :', searchPlace)
        
        const searchPage = await browser.newPage()        
        
        await searchPage.setRequestInterception(true); // HttpRequest 수집 준비
        let naverReqUrl
        searchPage.on('request', async req => {
            let requestURL = req.url()
            // if (req.resourceType() === 'xhr') {
            //     console.log('xhr 확인중:',requestURL)
            // }
            if (requestURL.indexOf("https://map.naver.com/v5/api/addresses/") > -1) {
                naverReqUrl = requestURL
                console.log('네이버 Request Url 수집 결과:', naverReqUrl)

                /* Request URL 에서 위도 경도 값 추출 */
                naverReqUrl = checkNaverlocation(naverReqUrl)
                console.log('네이버 위도 경도 결과 :', naverReqUrl)

                await req.abort(); // 작업 중단
                console.log('Request Url 수집 후 반환')

                // await searchPage.close()
                // await browser.close()

                return naverReqUrl
            } else {
                await req.continue()
            }
        });

        await searchPage.goto(searchUrl, {waitUntil:'networkidle2'})    /* Naver Map url 이동 */
        console.log('네이버 지도 이동')
    
        const inputBox = '#container > shrinkable-layout > div > app-base > search-input-box > div > div > div > input'
        await searchPage.waitForSelector(inputBox)
   
        // console.log('검색바 렌더링 완료')
  
        // await searchPage.mouse.click(168, 67, { button: 'left' }) // 검색바 클릭
        // console.log('검색바 클릭 완료')

        await searchPage.keyboard.type(searchPlace) // 주소 입력
        // console.log('입력 완료!!')
        await searchPage.keyboard.press('Enter')
        // console.log('주소 검색!!')
        await searchPage.waitForTimeout(10000) // 5초 -> 10초 -> 12초 ->15초 
        console.log('좌표 수집 10초 대기 완료')
        // let checkTag1 = await searchPage.$('#app-root > div > div')
        // #app-root > div > div > div 여러 검색결과가 나올 경우
        // console.log('browser.close()')
        await searchPage.close()
        await browser.close()

        return naverReqUrl
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        process.exit()
    }
}
// getNaverLocation(place)

// Google Map : Request Url -> 좌표값 획득
/* google map 에서 좌표 값 획득 */
exports.getGoogleLocation = async(argSearchPlace) => {
    try{
        const browser = await puppeteer.launch({                    /* puppeteer 브라우저 실행 */
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,    
        })

        const searchPlace  = argSearchPlace                               /* 검색할 관광명소 */
        const searchUrl = 'https://www.google.co.kr/maps/'          /* Google Map URL */

        console.log('구글 지도 좌표값 수집할 장소 :', searchPlace) 
        
        const searchPage = await browser.newPage()                            
        await searchPage.goto(searchUrl, {waitUntil:'networkidle2'})    /* Google Travel 접속 */

        await searchPage.waitForSelector('input#searchboxinput')
        await searchPage.type('input#searchboxinput', searchPlace)      /* 검색할 장소 입력 */
        await searchPage.keyboard.press('Enter')                        /* 해당 장소 검색 */
        await searchPage.waitForTimeout(5000)
    
        let url = searchPage.url()                     /* 위도, 경도 값이 포함된 URL 획득 */                
        console.log("구글 지도 URL : ",url)

        /* URL 에서 위도 경도 값 추출 */
        let start  = url.indexOf('@')
        let end    = url.lastIndexOf(',')
        let urlCut = url.substring(start+1, end)        /* URL에서 좌표값만 남김*/
        let location = urlCut.split(',')                /* 좌표 값 위도, 경도 구분 */
        let lat = location[0]                           /* 위도 */
        let lng = location[1]                           /* 경도 */
        let locationData = {lat, lng}                   /* {위도, 경도} */
        // console.log('구글지도 URL 좌표값 결과 :', locationData)

        await searchPage.close()
        await browser.close()
        
        return locationData

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        process.exit()
    }
}
// getGoogleLocation(place)