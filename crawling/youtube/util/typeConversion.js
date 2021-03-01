/* 유튜브 조회수, 구독자수 sting->number '조회수 10만회'->100000 */
/* index에서 loop문 활용 조회수 구독자수 cast함수로 수정 후 json 보내기 */
exports.cast = (argString) => {
    try {
        let text = argString
        const regex = /[ㄱ-ㅎ가-힣]+(\s*)/g /* 한글인 문자 + 공백 제거 */

        let num = text.replace(regex,'') /* 기존 문자열에서 숫자가 아닌 모든 문자열을 빈 문자로 변경 */
        num = parseFloat(num) /* string -> number */
        // console.log('\n========== String -> Number ==========')
        // console.log('String:', text)
        // console.log('Number:', num)

        if(!Number(num)) { /* num 숫자가 아닐 경우 예외처리 */
            throw new Error('숫자가 없습니다.')
        }
        
        if(text.includes('천')) 
        {
            num = num*1000
            // console.log('천 :',num,'\n')
            return num
        } else if (text.includes('만')) 
        {
            num = num*10000
            // console.log('만 :',num,'\n')
            return num
        } else if (text.includes('억')) 
        {
            num = num*100000000
            // console.log('억 :',num,'\n')
            return num
        } else {
            // console.log('0~999 :', num,'\n')
            return num
        }
    } catch(e) {
        console.log(`다음과 같은 에러가 발생했습니다: ${e.name}: ${e.message}`);
    }
}