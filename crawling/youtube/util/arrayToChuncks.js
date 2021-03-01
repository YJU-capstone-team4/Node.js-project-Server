    /* 지정한 수만큼 배열을 쪼갬 -> 비동기 병렬 처리 */
    exports.arrayToChunks = (array, CHUNKSIZE) => {
        const results = [];
        let start = 0;
      
        while (start < array.length) {
          results.push(array.slice(start, start + CHUNKSIZE));
          start += CHUNKSIZE;
        }
        return results;
    };