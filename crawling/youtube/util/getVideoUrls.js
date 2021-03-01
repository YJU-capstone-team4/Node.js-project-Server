/* 특정 유튜버 업로드한 동영상 링크 획득 */
const puppeteer = require('puppeteer');

const channel_name = '하얀트리HayanTree';
const video_count = 470;

const getVideoUrls = async(arg_channel_name, arg_video_count) => {
    try{
        const browser = await puppeteer.launch({
            headless: false                   
        });

        const search_channel = arg_channel_name;                                  // 검색할 유튜브 채널 명
        const search_link    = 'https://www.youtube.com/results?search_query=';   // 유튜버 검색 링크

        console.log('업로드 동영상 링크 수집할 유튜버 :', search_channel);

        const search_page = await browser.newPage();                            
        await search_page.goto(search_link+search_channel, {waitUntil:"networkidle2"}); // 해당 유튜버 채널 검색
        
        // <<-- 업로드한 동영상 페이지 이동
        await search_page.click('#main-link');                                          // 유튜브 채널 클릭
        await search_page.waitForSelector('#tabsContent');
        await (await search_page.$('#tabsContent > paper-tab:nth-child(4)')).click();   // 업로드한 동영상 페이지 이동
        await search_page.waitForSelector('#items > ytd-grid-video-renderer');          // 업로드한 영상들 불러올때까지 대기
        // -->>

        // <<-- 업로드한 동영상 링크 획득
        let upload_video_link = [];
        while (upload_video_link.length < arg_video_count) // parseInt(video_count)
        {
            const get_link = await search_page.evaluate(() => {
                let result = [];
                const upload_video = document.querySelectorAll('#items > ytd-grid-video-renderer');
            
                for(i=0; i < upload_video.length; i++)
                    {
                        const video_link = upload_video[i].querySelector('#video-title').getAttribute('href');
                        result.push(video_link);
                        upload_video[i].parentNode.removeChild(upload_video[i]); // 획득한 영상 태그 삭제
                    } 
                    window.scrollBy(0, 300); // 세로로 100 픽셀 내린 효과
                    window.scrollBy(600, 0); // 세로로 200 픽셀 올린 효과

                    return result;            
            }); 
            upload_video_link = upload_video_link.concat(get_link);   
        };
        console.log(search_channel,'업로드 영상 링크 :', upload_video_link);
        // -->> 

        browser.close();
        return upload_video_link;

    } catch(err) {
        console.log(err);
    }
};
module.exports = getVideoUrls(channel_name, video_count)