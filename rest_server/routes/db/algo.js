// pagination 함수
async function pagination(req, res, Collection) {
    const { page = 1, limit = 10 } = req.query;
    const whole = await Collection.find();        // shareFlowTb 전체 값

    // 페이지네이션을 위한 몽고DB 쿼리
    const collection = await Collection.find()
    .limit(limit * 1)
    .skip((page-1) * limit);

    // 페이지 그룹
    const pageCount = 5;                          // 페이지 그룹에 보일 페이지 수
    var pageGroup = Math.ceil(page/pageCount);    // 현재 페이지 그룹 위치
    const totalPage = Math.ceil(whole.length/limit);  // 전체 페이지 수

    var last = pageGroup * pageCount;             // 화면에 보여질 페이지 맨 뒤 숫자
    if (last > totalPage)
        last = totalPage
    var first = last - (pageCount - 1);           // 화면에 보여질 페이지 맨 앞 숫자
    if (first < 1)
        first = 1

    var next = last + pageCount;
    if (next > (totalPage/pageCount) * pageCount || next < pageCount + 1)
        next = null;
    var prev = first - pageCount;
    if (prev < 1)
        prev = null;

    res.status(200).json({
        total: whole.length,        // 전체 개수
        current: collection.length,// 현재 페이지 개수
        totalPage : totalPage,      // 전체 페이지 숫자
        page: page,                 // 현재 페이지
        first: first,               // 화면에 보여질 페이지 맨 앞 숫자
        last: last,                 // 화면에 보여질 페이지 맨 뒤 숫자
        next: next,                 // 다음 버튼
        prev: prev,                 // 이전 버튼
        collection
    })
}

exports.pagination = pagination;