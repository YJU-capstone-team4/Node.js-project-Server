// 네이버 지도 크롤링 결과 [가게주소]
// 가게주소의 시/도 분석 -> 관리자 region 태그의 form으로 반환
// 변환할 시/도
// 서울 대구 부산 인천 광주 대전 울산 세종시 경기도 강원도 
// 충청북도 충청남도 전라북도 전라남도 경상북도 경상남도 제주도
/* 
매개변수 -> 가게주소 
배열 요소를 순회 -> [변환할 시/도] 키워드가 포함된 요소 탐색 -> 해당 키워드 반환
*/
const addr = '서울 영등포구 국회대로68길 23 B1'

exports.checkRegion = async(argAddress) => {
    const region = ['서울', '서울특별시', '대구', ,'대구광역시', '부산', '부산광역시',
                    '인천', '인천광역시', '광주', '광주광역시', '대전', '대전광역시',
                    '울산', '울산광역시', '세종시', '세종특별자치시', '경기도', 
                    '강원도', '충청북도', '충북', '충청남도', '충남', '전라북도', '전북', '전라남도', 
                    '전남','경상북도', '경북', '경상남도', '경남', '제주도', '제주특별자치도']

    let address = argAddress

    address = address.split(' ')
    
    console.log(address)

    let check = address.filter(e => {
        if (region.includes(e)) {
            return e
        }
    })
    check = check.join('')

    console.log(check)

    let checkIndex = region.indexOf(check)
    console.log(checkIndex)

    if(checkIndex == 1||3||5||7||9||11||13||15||19||21||23||25||27||29||31) {
        check = region[checkIndex-1]
        console.log('region Tag 변환 :', check)
        return check
    }
    else if(check == undefined) {
        // 지역 태그를 못 찾을 경우
        console.log('region Tag 없음')
        return ''
    } 
    else {
        console.log('region Tag :', check)
        return check
    }
}
// checkRegion(addr)