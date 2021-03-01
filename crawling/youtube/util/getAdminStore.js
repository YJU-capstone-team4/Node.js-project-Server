const { getNaverLocation } = require('./getLocation')
const puppeteer = require('puppeteer')

// const place = '부산광역시 남구 대연동 수영로 309' // 216-4
// const place = 'asdfasdf'
// const place = '대구 서구 내당동 내당칼국수'

/* google Maps, Naver Map, Kakao Map 3사 지도 검색 결과 admin -> 반환 */

// Naver Map admin 반환할 데이터 획득
exports.adminNaverMap = async(argSearchPlace) => {
    try{
        const browser = await puppeteer.launch({ 
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,      
        })

        const searchPlace  = argSearchPlace /* 수집할 장소 */
        const searchUrl    = 'https://m.map.naver.com/' /* 네이버 모바일 지도 URL */

        // console.log('검색할 장소 이름 :', searchPlace)
        
        const searchPage = await browser.newPage() 

        await searchPage.goto(searchUrl)    /* Naver Map url 이동 */ // , {waitUntil:'networkidle2'}
        console.log('네이버 지도 이동')
    
        const searchBox = '#header > header > div.Nsearch._searchKeywordView._searchGuide > div > div > div > span.Nbox_text._textPanel > input'
        await searchPage.waitForSelector(searchBox)
        await searchPage.waitForTimeout(2000)
        await searchPage.click(searchBox)                /* 권한 요청 alert 때문에 검색바 클릭 */
        await searchPage.type(searchBox, searchPlace)    /* 주소 검색란에 주소 입력 */
        await searchPage.keyboard.press('Enter') 
        
        // await console.log('주소 검색 완료')
        await searchPage.waitForTimeout(2000)

        let naverResult
        if(await searchPage.$('#ct > div.search_listview._content._ctList > div.section_err._errorMessage > div > a') !== null) {
            naverResult = { crawlingPlatform : 'Naver', data : [] }
            console.log('네이버 검색결과가 없습니다. \n', naverResult)

            searchPage.close()
            browser.close()
            return naverResult
        }

        // 검색어에 따라 태그 변경
        let storeListSelector = '#ct > div.search_listview._content._ctAddress > ul > li'
        let storeListTag = await searchPage.$(storeListSelector)
        // console.log('네이버 지도 태그 있음')
    
        let crawlingStore
        let address
        if (storeListTag == null) {
            // console.log('네이버 지도 태그 변환')

            crawlingStore = await searchPage.$eval(
                "#ct > div.search_listview._content._ctList > ul > li:nth-child(1) > div.item_info > a > div > strong", element => {
                    return element.textContent;
                })
            address = await searchPage.$eval(
                "#ct > div.search_listview._content._ctList > ul > li:nth-child(1) > div.item_info > div.item_info_inn > div > a", element => {
                    return element.textContent;
                })
        } else {
            crawlingStore = await searchPage.$eval(
                "#ct > div.search_listview._content._ctAddress > ul > li:nth-child(1) > div.item_info > a > div > strong", element => {
                    return element.textContent;
                })
    
            address = await searchPage.$eval(
                "#ct > div.search_listview._content._ctAddress > ul > li:nth-child(1) > div.item_info > div.item_info_inn > div > a", element => {
                    return element.textContent;
                })  
        }

        // console.log('네이버지도 주소:', address)
        address = address.replace('주소보기', '').trim()
        // console.log('네이버 주소 변환:', address)

        const crawlingLocation = await getNaverLocation(address) // 네이버지도에서 좌표값 획득
      
        if(crawlingLocation == null||undefined) {
            naverResult = { crawlingPlatform : 'Naver', data : [] }
            console.log('네이버 좌표값이 없습니다. \n', naverResult)

            searchPage.close()
            browser.close()
            return naverResult
        }
        
        let naverData = {crawlingStore : crawlingStore, address : address, crawlingLocation}

        let data = []
        data.push(naverData)
        
        naverResult = { crawlingPlatform : 'Naver', data : data }
        console.log('admin 네이버지도 결과', naverResult)
        // <<-- 주소가 있을 경우



        searchPage.close()
        browser.close()

        return naverResult

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        return { crawlingPlatform : 'Naver', data : [] }
    }
}
// adminNaverMap(place)


// Google Map admin 반환할 데이터 획득
exports.adminGoogleMap = async(argSearchPlace) => {
    try{
        const browser = await puppeteer.launch({ 
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,      
        })

        const searchPlace  = argSearchPlace /* 수집할 장소 */
        const searchUrl   = 'https://www.google.co.kr/maps/@37.053745,125.6553969,5z?hl=ko' /* Google Map URL */

        // console.log('검색할 장소 이름 :', searchPlace)
        
        const searchPage = await browser.newPage() 

        await searchPage.goto(searchUrl)    /* Naver Map url 이동 */
        console.log('구글 지도 이동')
    
        const inputBox = '#searchboxinput'
        await searchPage.waitForSelector(inputBox)
        // console.log('검색바 렌더링 완료')

        await searchPage.keyboard.type(searchPlace) // 주소 입력
        // console.log('입력 완료!!')

        await searchPage.keyboard.press('Enter')
        // console.log('주소 검색!!')

        await searchPage.waitForTimeout(3000)

        let googleResult
        
        const storeSelector = '#pane > div > div.widget-pane-content.scrollable-y > div > div > div.section-hero-header-title > div.section-hero-header-title-top-container > div.section-hero-header-title-description > div:nth-child(1) > h1 > span:nth-child(1)'
        const addressSelector = '.ugiz4pqJLAG__primary-text.gm2-body-2'

        if(await searchPage.$(storeSelector) == null) {
            googleResult = { crawlingPlatform : 'Google', data : [] }
            console.log('구글 검색결과가 없습니다. \n', googleResult)

            searchPage.close()
            browser.close()
            return googleResult
        } 
        else if (await searchPage.$(addressSelector) == null) {
            googleResult = { crawlingPlatform : 'Google', data : [] }
            console.log('구글 검색결과가 없습니다. \n', googleResult)

            searchPage.close()
            browser.close()
            return googleResult
        }

        // console.log('구글지도 태그 대기중')
        await searchPage.waitForSelector(storeSelector)
        await searchPage.waitForSelector('.ugiz4pqJLAG__primary-text.gm2-body-2')
    
        let crawlingStore = await searchPage.$eval(
            storeSelector, element => {
                return element.textContent;
            })
        
        let address = await searchPage.$eval(
            ".ugiz4pqJLAG__primary-text.gm2-body-2", element => {
                return element.textContent;
            })
        
        const crawlingLocation = await getNaverLocation(address) // 네이버지도에서 좌표값 획득

        if(crawlingLocation == null||undefined) {
            googleResult = { crawlingPlatform : 'Google', data : [] }
            console.log('구글 좌표값이 없습니다. \n', googleResult)

            searchPage.close()
            browser.close()
            return googleResult
        }

        let googleData = {crawlingStore : crawlingStore, address : address, crawlingLocation}

        let data = []
        data.push(googleData)
        
        googleResult = { crawlingPlatform : 'Google', data : data }
        console.log('admin 구글지도 결과', googleResult)

        searchPage.close()
        browser.close()

        return googleResult

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        console.log('에러 발생 리턴값 변경')
        return {crawlingPlatform : 'Google', data : [] }
    }
}
// adminGoogleMap(place)


// Kakao Map admin 반환할 데이터 획득
exports.adminKakaoMap = async(argSearchPlace) => {
    try{
        const browser = await puppeteer.launch({ 
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,      
        })

        const searchPlace  = argSearchPlace /* 수집할 장소 */
        const searchUrl   = 'https://map.kakao.com/' /* kakao Map URL */

        // console.log('검색할 장소 이름 :', searchPlace)
        
        const searchPage = await browser.newPage() 

        await searchPage.goto(searchUrl)    /* Naver Map url 이동 */
        console.log('카카오 지도 이동')
    
        const inputBox = '#search'
        await searchPage.waitForSelector(inputBox)
        // console.log('검색바 렌더링 완료')

        await searchPage.keyboard.type(searchPlace) // 주소 입력
        // console.log('입력 완료!!')

        await searchPage.keyboard.press('Enter')
        // console.log('주소 검색!!')

        await searchPage.waitForTimeout(2000)

        // await searchPage.waitForSelector('.section.places.lst > .placelist')
        // console.log('목록 대기')

        let storeList = await searchPage.$$eval('.section.places.lst > .placelist > li', e => e.length)
        // console.log('카카오 가게 목록 수:', storeList)

        let kakaoResult
        if (storeList == 0) {
            kakaoResult = { crawlingPlatform : 'Kakao', data : [] }
            console.log('카카오 검색결과가 없습니다. \n', kakaoResult)

            searchPage.close()
            browser.close()
            return kakaoResult
        }

        let data = []
        // for(i=1; i <= storeList; i++) {
        //     console.log('수집중', i+'개')
        //     let crawlingStore
        //     if(i == 1) {
        //         crawlingStore = await searchPage.$eval('.section.places.lst > .placelist > li:nth-child('+i+') > div.head_item.clickArea > strong > a.link_name > strong', e => {
        //             return e.textContent
        //         })}
        //     else {
        //         crawlingStore = await searchPage.$eval('.section.places.lst > .placelist > li:nth-child('+i+') > div.head_item.clickArea > strong > a.link_name', e => {
        //             return e.textContent
        //         })}

        //     let address = await searchPage.$eval('.section.places.lst > .placelist > li:nth-child('+i+') > div.info_item > div.addr > p:nth-child(1)', e => {
        //         return e.textContent
        //     })

        /* 상위 1개만 크롤링 */
        let crawlingStore = await searchPage.$eval(
            ".section.places.lst > .placelist > li:nth-child(1) > div.head_item.clickArea > strong > a.link_name > strong", element => {
                return element.textContent;
            })
        let address = await searchPage.$eval(
            ".section.places.lst > .placelist > li:nth-child(1) > div.info_item > div.addr > p:nth-child(1)", element => {
                return element.textContent;
            })

        let crawlingLocation =  await getNaverLocation(address) // 네이버지도에서 좌표값 획득

        if(crawlingLocation == null||undefined) {
            kakaoResult = { crawlingPlatform : 'Kakao', data : [] }
            console.log('카카오 좌표값이 없습니다. \n', kakaoResult)

            searchPage.close()
            browser.close()
            return kakaoResult
        }

        let kakaoData = {crawlingStore : crawlingStore, address : address, crawlingLocation}
        data.push(kakaoData)
        
        kakaoResult = { crawlingPlatform : 'Kakao', data : data }

        console.log('카카오 결과:', kakaoResult)

        searchPage.close()
        browser.close()

        return kakaoResult

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
        return { crawlingPlatform : 'Kakao', data : [] }
    }
}
// adminKakaoMap(place)