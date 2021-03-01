const puppeteer = require('puppeteer')
const { getStoreInfo } = require('./getStoreInfo')
const { regMore } = require('./util/regMore')
const { checkRegion } = require('./util/checkRegion')

/* {영상 제목, 영상 조회수, 업로드 날짜, 더보기 정보, {가게이름, 가게주소,'맛집', { 좌표값(예정) } } } */
exports.getUrlsInfo = async(argVideoUrl) => {
    try{
        const browser = await puppeteer.launch({ 
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'], 
            'ignoreHTTPSErrors': true,                   
        })
        const videoUrl = 'https://www.youtube.com'+argVideoUrl /* 수집할 영상 URL */

        console.log('수집할 유튜브 영상 URL :', videoUrl) 

        const searchPage = await browser.newPage()                            
        await searchPage.goto(videoUrl, {waitUntil:'networkidle2'}) /* 수집할 유튜브 영상 검색 */
        await searchPage.waitForSelector('#content > #description > yt-formatted-string')
        
        /* [{영상 제목, 영상 조회수, 업로드 날짜, 더보기란, }] */
        let videoData = await searchPage.evaluate(()=>{
            const ytbVideoName = document.querySelector('#container > h1 > yt-formatted-string').textContent
            let   hits         = document.querySelector('#count > yt-view-count-renderer > span.view-count.style-scope.yt-view-count-renderer').textContent /* 영상 조회수 */
            hits = Number(hits.replace(/[^0-9]/g,''))
            let uploadDate     = document.querySelector('#date > yt-formatted-string').textContent /* 업로드 날짜 */
                const regDate = /[.]/gi
                uploadDate = uploadDate.replace(regDate, '-')
                uploadDate = uploadDate.replace(/(\s*)/g, '') /* 공백 제거 */
                uploadDate = uploadDate.slice(0, -1)          /* 마지막 문자열 제거 */
            const ad = document.querySelector('#movie_player > div.ytp-paid-content-overlay > div').textContent /* 유료 광고 태그 */
            let more = document.querySelector('#description > yt-formatted-string').innerText /* 더보기 정보 */

            /* 유료 광고 포함 영상 제외 */
            if(ad == '') { 
                let videoData = {ytbVideoName, hits, uploadDate, more}
                return videoData
            } else {
                return false
            }
        });

        /* 유료 광고 영상일 경우 false */
        if(videoData == false) { 
            console.log('\n유료광고 영상 입니다.') 
            console.log('수집 제외')
            searchPage.close()
            browser.close()
            return false
        } 
        else {
            /* 유료 광고 영상이 아닐 경우 -> 더보기란 가게 주소 파싱 */
            let storeInfo = await getStoreInfo(videoData.more)
          
            if(storeInfo == false||undefined) {
                console.log('가게 정보 수집 실패')
                browser.close()
                return false
            } else {
                videoData.more = videoData.more.split('\n')
                videoData.more = await regMore(videoData.more) /* 더보기란 '-'제외한 특수문자 제거 + 공백 제거한 배열 */
                videoData['storeInfo'] = storeInfo /* videoData -> stroeInfo 객체 추가 */

                if(storeInfo !== '에러') {
                    console.log('region tag 주소 :', videoData.storeInfo.storeAddress)
                    const regionTag = await checkRegion(videoData.storeInfo.storeAddress)
                    console.log('region 태그 결과 :', regionTag)
                    videoData['regionTag'] = regionTag
                    videoData['status'] = '완료'
                } 
                else {
                    videoData['regionTag'] = ''
                    videoData['status'] = '에러'
                    videoData.storeInfo['location'] = '' // 에러일 경우 location '' 값
                }
                searchPage.close()
                browser.close()

                // console.log('videoData:', videoData)

                return videoData
            }
        }
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getUrlsInfo('/watch?v=0ZtSAOX1Ji0')