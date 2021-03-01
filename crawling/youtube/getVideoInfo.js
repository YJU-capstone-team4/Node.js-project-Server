const puppeteer = require('puppeteer')

/* {썸네일, 영상 URL, 영상제목} */
exports.getVideoInfo = async(argChannelUrl, argVideoCount) => {
    try{
        const browser = await puppeteer.launch({
            headless: true,                             
            ignoreDefaultArgs: ['--disable-extensions'],
            args : [ '--no-sandbox', '--disable-setuid-sandbox'],
            'ignoreHTTPSErrors': true,                   
        })

        const channelUrl = argChannelUrl                                /* 수집할 유튜브 채널 URL */
        const searchPage = await browser.newPage()                            
        await searchPage.goto(channelUrl, {waitUntil:'networkidle2'})   /* 수집할 유튜버 채널 이동 */

        // <<-- 업로드한 동영상 페이지 이동 
        await searchPage.waitForSelector('#tabsContent')
        await searchPage.waitForTimeout(2000)
        await (await searchPage.$('#tabsContent > paper-tab:nth-child(4)')).click()   /* 업로드한 동영상 페이지 이동 */
        await searchPage.waitForSelector('#items > ytd-grid-video-renderer')          /* 업로드한 동영상 렌더링 대기 */
        // -->>
        
        let uploadVideoData = [] /* [{영상 URL, 썸네일, 영상제목},...] */
        while (uploadVideoData.length < argVideoCount)
        {
            await searchPage.waitForSelector('#items > ytd-grid-video-renderer')
            // let waitImg = await searchPage.$$eval('#items > ytd-grid-video-renderer', e => e.length)
            let waitImg = argVideoCount
           
            /* 페이지 리소스 렌더링 대기 */
            for(i=1; i <= waitImg; i++)
            {
                console.log('썸네일 리소스 렌더링 중', i)
                await searchPage.evaluate(() => {
                    window.scrollBy(0, 500)
                })
                await searchPage.waitForTimeout(100)
                await searchPage.waitForSelector('#items > ytd-grid-video-renderer:nth-child('+i+') > #dismissible > ytd-thumbnail > #thumbnail > yt-img-shadow > #img')
            }

            console.log('리소스 렌더링 완료')
            const getData = await searchPage.evaluate(() => {
                let result = []; /* [{영상 URL, 썸네일, 영상 제목, 영상 조회수}] */
                let uploadVideo = document.querySelectorAll('#items > ytd-grid-video-renderer') /* 해당 요소의 리스트 획득 */
                for(i=0; i < uploadVideo.length; i++)
                    {
                        const ytbThumbnail = uploadVideo[i].querySelector('#dismissible > ytd-thumbnail > #thumbnail > yt-img-shadow > #img').getAttribute('src') 
                        const ytbAddress   = uploadVideo[i].querySelector('#video-title').getAttribute('href') 
                        const ytbVideoName = uploadVideo[i].querySelector('#video-title').textContent 

                        const videoData = {ytbThumbnail, ytbAddress, ytbVideoName}
                        result.push(videoData)
                        uploadVideo[i].parentNode.removeChild(uploadVideo[i]) /* 획득한 영상 element 삭제 */
                    }
                    window.scrollBy(0, 300) /* 스크롤 내림으로써 새 업로드 영상 리스트 로딩 */
                    window.scrollBy(300, 0)                                     
                    return result        
            })   
            await searchPage.waitForTimeout(1500) 
            uploadVideoData = uploadVideoData.concat(getData)
        }

        console.log('결과:', uploadVideoData)
        console.log('결과 개수:', uploadVideoData.length)

        searchPage.close()
        browser.close()
        return uploadVideoData

    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
};

// getVideoInfo('https://www.youtube.com/channel/UCsNVs68quFJMaDmR6frfUsQ', 1131)