const puppeteer = require('puppeteer')
const { cast } = require('./util/typeConversion')

/* {유튜브 채널명, 유튜버 프로필 이미지, 구독자 수, 업로드 영상 수, 총 조회수, 유튜브 채널 URL} */
exports.getYoutuberInfo = async(argChannelName) => {
    try{
        const browser = await puppeteer.launch({        /* puppeteer 브라우저 실행 */
            headless: true,                             /* chrome 브라우저 표시 */
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'], /* sandbox : 크롬 보안 시스템 */
            'ignoreHTTPSErrors': true,                            /* 탐색 중 HTTPS 오류를 무시할지 여부 */
            // executablePath: '/usr/bin/chromium-browser',      /* 번들로 제공되는 Chromium 대신 실행할 브라우저 실행 파일의 경로 */
        })

        const searchChannel =  argChannelName                                          /* 검색할 유튜브 채널이름 */
        const searchUrl     = 'https://www.youtube.com/results?search_query='          /* 유튜버 검색을 위한 URL */

        // console.log('수집할 유튜버 :', searchChannel)

        const searchPage = await browser.newPage()                           
        await searchPage.goto(searchUrl+searchChannel, {waitUntil:'networkidle2'})      /* 검색할 유튜버 채널 검색 */
        
        let youtuberData = await searchPage.evaluate(() => {
            const ytbProfile   = document.querySelector('#img').getAttribute('src')      /* 유튜버 프로필 이미지 */
            const ytbChannel   = document.querySelector('#channel-title > #container > #text-container > #text').textContent /* 유튜브 채널명 */
            let   ytbSubscribe = document.querySelector('#subscribers').textContent     /* 구독자 수 */
            let   videoCount   = document.querySelector('#video-count').textContent     /* 업로드 영상 수 */
            videoCount = Number(videoCount.replace(/[^0-9]/g,''))                       /* 업로드 영상 수 숫자만 파싱 */

            let youtuberData = {ytbProfile, ytbChannel, ytbSubscribe, videoCount}
            return youtuberData
        })
        youtuberData.ytbSubscribe = await cast(youtuberData.ytbSubscribe)                 /* 구독자수 String -> Number */

        // <<-- 채널 정보 페이지 이동 
        await searchPage.click('#main-link')                                              /* 유튜브 채널 클릭 */
        const ytbLinkAddress = await searchPage.url()                                     /* 해당 유튜브 채널 URL 획득  */
        console.log("유튜브 채널 URL :", ytbLinkAddress,'\n')
        await searchPage.waitForSelector('#tabsContent')
        await searchPage.waitForTimeout(2000)
        await (await searchPage.$('#tabsContent > paper-tab:nth-last-child(5)')).click()  /* 채널 정보 페이지 이동 */
        await searchPage.waitForSelector('#right-column')                                 /* 총 조회수 요소 렌더링 대기 */
        // -->>

        let youtuberViews = await searchPage.evaluate(() => {                              /* 유튜버 총 조회수 */
            let ytbHits = document.querySelector('#right-column > yt-formatted-string:nth-child(3)').textContent /* 총 조회수 */
            return ytbHits = Number(ytbHits.replace(/[^0-9]/g,''))
        })
        youtuberData['ytbHits'] = youtuberViews
        youtuberData['ytbLinkAddress'] = ytbLinkAddress

        // console.log(searchChannel,'유튜버 정보 :', youtuberData) 
        searchPage.close()
        browser.close()

        return youtuberData

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getYoutuberInfo('야식이')
// module.exports = getYoutuberInfo

