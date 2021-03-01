const puppeteer = require('puppeteer')

exports.getNaverStoreInfo = async(argAddress) => {
    try{
        const browser = await puppeteer.launch({         
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'], 
            'ignoreHTTPSErrors': true,                             
            // executablePath: '/usr/bin/chromium-browser',     /* 번들로 제공되는 Chromium 대신 실행할 브라우저 실행 파일의 경로 */
        })

        const searchAddr    =  argAddress                         /* 검색할 가게 주소 */
        const searchUrl     = 'https://m.map.naver.com/'          /* 네이버 모바일 지도 URL */

        console.log('네이버 지도 검색할 주소 :', searchAddr)

        const searchPage = await browser.newPage()
        // await console.log('브라우저 생성')                     
        await searchPage.goto(searchUrl, {waitUntil:'networkidle2'})

        // await console.log('네이버 지도 페이지 이동!')

        const searchBox = '#header > header > div.Nsearch._searchKeywordView._searchGuide > div > div > div > span.Nbox_text._textPanel > input'
        await searchPage.waitForSelector(searchBox)
        await searchPage.waitForTimeout(2000)
        await searchPage.click(searchBox)                /* 권한 요청 alert 때문에 검색바 클릭 */
        await searchPage.type(searchBox, searchAddr)     /* 주소 검색란에 주소 입력 */
        await searchPage.keyboard.press('Enter') 
        
        // await console.log('주소 검색 완료')

        // 검색어에 따라 태그 변경 -> 수집률 상승
        // 주소+n : #ct > div.search_listview._content._ctList > ul > li:nth-child(1)
        // 주소   : #ct > div.search_listview._content._ctAddress > ul > li:nth-child(1)
        var storeListSelector = '#ct > div.search_listview._content._ctAddress > ul > li'
        await searchPage.waitForTimeout(2000) // --> 이게 문제인듯...하다
        // await searchPage.waitForSelector(storeListSelector)
        // 모듈
        let storeListTag = await searchPage.$(storeListSelector)
        // console.log('네이버 지도 태그', storeListTag)
    
        if (storeListTag == null) {
            // console.log('네이버 지도 태그 변환')
            storeListSelector = '#ct > div.search_listview._content._ctList > ul > li'
        }

        await searchPage.waitForSelector(storeListSelector)
        await searchPage.waitForTimeout(1000)
        let storeListAll = await searchPage.$$eval(storeListSelector, e => e.length)  // TimeoutError: waiting for selector

        // console.log('가게 목록 수', storeListAll)

        let storeInfoResult = [] /* [{가게이름, 가게주소},...] */
        while(storeInfoResult.length < storeListAll) {
            const storeInfo = await searchPage.evaluate(() => {
                // 모듈로만들자...
                let storeListSelector = '#ct > div.search_listview._content._ctAddress > ul > li'
                let storeListTag =  document.querySelector(storeListSelector)
            
                if (storeListTag == null) {
                    // console.log('네이버 지도 태그 변환')
                    storeListSelector = '#ct > div.search_listview._content._ctList > ul > li'
                }

                let result = [] /* [{가게이름, 가게주소}] */
                let storeList = document.querySelectorAll(storeListSelector) // storeListSelector -> 변수 스코프 문제

                for(i=0; i < storeList.length; i++) {
                    let storeInfoData = {} /* {가게이름, 가게주소} */

                    storeInfoData.storeName = storeList[i].querySelector('div.item_info > a.a_item.a_item_distance._linkSiteview > div > strong').textContent
                    storeInfoData.storeAddr = storeList[i].querySelector('div.item_info > div.wrap_bx_address._addressBox > div > p:nth-child(1)').textContent

                    result.push(storeInfoData)
                }
                return result
            })
            storeInfoResult = storeInfoResult.concat(storeInfo)
        }
        // console.log('네이버 지도 가게정보 :', storeInfoResult)
        browser.close()
    
        return storeInfoResult

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getNaverStoreInfo(address)