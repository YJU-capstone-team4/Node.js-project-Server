const { getYoutuberInfo } = require('./getYoutuberInfo')     /* {유튜브 채널명, 유튜버 프로필 이미지, 구독자 수, 업로드 영상 수, 총 조회수, 유튜브 채널 URL} */
const { getVideoInfo }    = require('./getVideoInfo')        /* {썸네일, 영상 URL, 제목} */
const { getUrlsInfo }     = require('./getUrlsInfo')         /* {영상 제목, 영상 조회수, 업로드 날짜, 더보기 정보} */
const { arrayToChunks }   = require('./util/arrayToChuncks') /* 비동기 병렬 처리 */
const { saveYoutuber }  = require('../../routes/db/algo')
let   { saveVideo }     = require('../../routes/db/algo')
let   { minusVideo }    = require('../../routes/db/algo')
const { sendFront }     = require('../../routes/db/algo')
const { sendFrontError }     = require('../../routes/db/algo')
const YtbCrawlingTb     = require('../../models/ytbCrawlingTb.model') // ytbCrawlingTb 모델

// ytbCrawlingTb collection에 맞게 json 반환
exports.getYtbCrawling = async(argChannelName) => {
    try{
        const channelName = argChannelName
        console.log('수집할 유튜브 채널명 :', channelName)
        
        let youtuberInfo = await getYoutuberInfo(channelName) /* 유튜버 정보 획득 */
        const channelUrl = youtuberInfo.ytbLinkAddress
        const videoCount = 50 // youtuberInfo.videoCount
        console.log(channelName, '유저 유튜버 신청 반환 :\n', youtuberInfo,'\n')
        console.log(channelName, '총 영상 수:', videoCount)
        console.log(channelName, 'Channel URL :', channelUrl)
        
        // youtuber정보 DB 저장
        saveYoutuber(YtbCrawlingTb, youtuberInfo.ytbChannel, youtuberInfo.ytbProfile, youtuberInfo.ytbLink, 
            youtuberInfo.ytbSubscribe, youtuberInfo.ytbHits, youtuberInfo.videoCount)

        console.log(saveYoutuber)

        console.log('saveYoutuber access 확인 :', access)

        // 관리자가 접속 했을 경우 소켓 전송(saveYoutuber)
        // if(access == true) {
        //     sendFront(YtbCrawlingTb)
        //     console.log('saveYoutuber', access)
        // }
        
        // const youtuberInfoJson  = await JSON.stringify(youtuberInfo) /* 유튜버 정보 JSON 문자열 변환 */
        // console.log('유튜버 정보 json \n', youtuberInfoJson)
        
        console.log('========== 영상 썸네일, URL ==========\n')
        let videoInfo = await getVideoInfo(channelUrl, videoCount)
        console.log(channelName, '영상 썸네일, URL :', videoInfo,'\n')
        
        let videoUrl = videoInfo.map(e => e.ytbAddress) /* 수집할 총 영상 링크 */
        console.log(channelName, '수집할 영상 URL 개수 :', videoUrl.length,'\n')
        
        console.log('========== 영상 정보, 가게정보, 좌표값, 지역태그, status ==========\n')
        const urlInfoResult = [] /* [{영상 제목, 영상 조회수, 업로드 날짜, 더보기 정보, 지역태그, {가게주소, 가게이름, 좌표값{위도, 경도} }, status },...] */
        const CHUNKSIZE = 1                                               
        
        const chunkedUrlInfoList = arrayToChunks(videoUrl, CHUNKSIZE)     
        console.log(chunkedUrlInfoList)
        
        let i = 0   // 총 수집 영상 수
        let err = 0 // 에러가 발생한 영상 수
        let fal = 0 // 제외 영상 수
        let video =[]   // ytbCrawlingTb video{url}
        
        // let videoJson
        // let videoJsonResult = []
        for(chunk of chunkedUrlInfoList) {     
            // 비동기 병렬 처리                          
            const urlInfoPromises = chunk.map((url) => getUrlsInfo(url))  
            const resolvedUrlInfo = await Promise.all(urlInfoPromises)    
        
            /* url -> getUrlsInfo 결과 */
            resolvedUrlInfo.forEach((url) => {
                if(url.storeInfo == '에러') {
                    err += 1
                    console.log('에러 영상 개수 :', err)

                    // video 크롤링 될때마다 DB에 저장(에러)
                    saveVideo(YtbCrawlingTb, youtuberInfo.ytbChannel, url.ytbVideoName, url.ytbThumbnail, url.ytbAddress, 
                        url.hits, url.uploadDate, url.more, url.status, '', '', '',
                        url.typeStore, 0, 0)

                    // 관리자가 접속 했을 경우 소켓 전송(saveVideo : '에러')
                    // if(access == true) {
                    //     sendFront(YtbCrawlingTb)
                    //     console.log('saveYoutuber', access)
                    // }
                    await sendFront(YtbCrawlingTb)
                    // await sendFrontError(youtuberInfo.ytbChannel, url.ytbVideoName)
                    console.log('saveYoutuber', access)
                } 
                else if(url == false) {
                    fal += 1
                    console.log('제외 영상 개수 :', fal)
                    minusVideo(YtbCrawlingTb, youtuberInfo.ytbChannel) // false일 경우 videoCount -1 (DB 저장)
                          
                }
                else if(url.status == '완료') {
                    // console.log('status 완료인 영상')
                    videoInfo.map(e => {
                        if(url.ytbVideoName == e.ytbVideoName) {
                            // console.log('영상 제목이 같을 경우 videoInfo', e)
                            url['ytbThumbnail'] = e.ytbThumbnail
                            url['ytbAddress'] = e.ytbAddress
                            // console.log('videoInfo -> url 통합 :', url)
                        }
                    })
                    // video = {'video':url}
                    // videoJson  = JSON.stringify(video)
                    // console.log('video 객체 json :', videoJson)
                    video.push(url) // '완료'인 영상 -> video 배열에 객체로 저장
                    console.log('video:', video)
                    // videoJsonResult.push(videoJson)
                    // console.log('videoJsonResult : ', videoJsonResult)

                    // video 크롤링 될때마다 DB에 저장(완료)
                    saveVideo(YtbCrawlingTb, youtuberInfo.ytbChannel, url.ytbVideoName, url.ytbThumbnail, url.ytbAddress, 
                        url.hits, url.uploadDate, url.more, url.status, url.regionTag, url.storeInfo.storeName, url.storeInfo.storeAddress,
                        url.storeInfo.typeStore, url.storeInfo.location.lat, url.storeInfo.location.lag)

                    // 관리자가 접속 했을 경우 소켓 전송(saveVideo : '완료')
                    // if(access == true) {
                    //     sendFront(YtbCrawlingTb)
                    //     console.log('saveYoutuber', access)
                    // }
                    await sendFront(YtbCrawlingTb)
                    console.log('saveYoutuber', access)
                }
                console.log(url)
                urlInfoResult.push(url)

                // 관리자가 접속 했을 경우 소켓 전송(saveVideo)
                // if(access == true) {
                //     sendFront(YtbCrawlingTb)
                // }
            })
            youtuberInfo['video'] = video // 유튜브 정보에 video 객체 추가
            console.log('video객체 추가:', youtuberInfo)
            
            i = i+CHUNKSIZE
            console.log('\n영상 정보 수집 상황 :', i +'/'+videoUrl.length) 
            const totalVideo      = videoUrl.length                  // 총 영상 수
            let collectionVideo   = urlInfoResult.length - fal       // 수집한 영상 수(false 제외)
            let completeVideo     = video.length                     // '완료'인 영상 수
            let successVideo      = collectionVideo - err            // 수집 성공 영상 수
        
            // console.log('수집한 영상 정보 :\n', urlInfoResult)
        
            // 실시간 수집률 확인
            console.log('\n총 영상 수 :', totalVideo,'\n')
            console.log('수집한 영상 수(에러+완료):', collectionVideo)  // 더보기란에 주소 형태소 분석이 되는 영상
            console.log('완료인 영상 수 :', completeVideo)               // '완료'인 영상 수
            console.log('에러 발생 영상 수 :', err)                      // [비교]가게주소x, [네이버지도]가게이름의 주소x, 상세 주소x 
            console.log('제외된 영상 수 :', fal)                         // 유료광고 + 주소x 영상
            // console.log('수집 성공 영상 수 :', successVideo)
            console.log('수집률 : ', Math.round(successVideo / collectionVideo * 100)+'%') // 수집률 반올림
        
            // console.log('수집한 영상 정보 :\n', urlInfoResult)
        }
    
        youtuberInfo['video'] = video // 유튜브 정보에 video 객체 추가
    
        // const indexResult = {youtuberInfo}
    
        // const indexResultJson = await JSON.stringify(youtuberInfo)
    
        // console.log('크롤링 결과 !\n', indexResult)
        // console.log('json으로 반환\n', indexResultJson)
    
        return youtuberInfo
    
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`)
    }
}
// getYtbCrawling('야식이')
