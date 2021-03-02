const puppeteer = require('puppeteer')
const { checkNaverlocation } = require('./checkLocation')

// const place = '서울특별시 영등포구 국회대로68길 23'
const place = '대전 동구 대전로 695-3 이동왕만두'
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
        // console.log('검색할 장소 이름 :', searchPlace)
        
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
                // console.log('네이버 Request Url 수집 결과:', naverReqUrl)

                /* Request URL 에서 위도 경도 값 추출 */
                naverReqUrl = checkNaverlocation(naverReqUrl)
                console.log('네이버 위도 경도 결과 :', naverReqUrl)


                await req.abort(); // 작업 중단

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
   
        console.log('검색바 렌더링 완료')
  
        // await searchPage.mouse.click(168, 67, { button: 'left' }) // 검색바 클릭
        console.log('검색바 클릭 완료')

        await searchPage.keyboard.type(searchPlace) // 주소 입력
        // console.log('입력 완료!!')
        await searchPage.keyboard.press('Enter')
        // console.log('주소 검색!!')
        await searchPage.waitForTimeout(5000)

        // let checkTag1 = await searchPage.$('#app-root > div > div')
        // #app-root > div > div > div 여러 검색결과가 나올 경우

        await searchPage.close()
        await browser.close()

        return naverReqUrl
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getNaverLocation(place)