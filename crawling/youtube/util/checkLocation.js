// const regUrl = 'https://map.naver.com/v5/api/addresses/126.9204359,37.528480500000015?address=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%98%81%EB%93%B1%ED%8F%AC%EA%B5%AC%20%EA%B5%AD%ED%9A%8C%EB%8C%80%EB%A1%9C68%EA%B8%B8%2023&lang=ko&detail=true'
   
/* 네이버 지도 Request URL 에서 위도 경도 값 추출 */
exports.checkNaverlocation = (argReqUrl) => {
    let start  = argReqUrl.indexOf('s/')
    let end    = argReqUrl.lastIndexOf('?')
    let urlCut = argReqUrl.substring(start+2, end)  /* URL에서 좌표값만 남김*/
    let location = urlCut.split(',')                /* 좌표 값 위도, 경도 구분 */
    let lat = location[1]                           /* 위도 */
    let lag = location[0]                           /* 경도 */
    const locationData = {lat, lag}      /* {장소이름, 위도, 경도} */
    // console.log('checkNaverlocation:', locationData)
    
    return locationData
}

// checkNaverlocation(regUrl)