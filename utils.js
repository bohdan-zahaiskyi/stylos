export const getAllIndexes = function(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}
export const formatPromiseResult = function(prom) {
    return prom
        .then(result => [null, result])
        .catch(err => [err]);
}
export const handleError = function(err, message) {
    if(err) {
        console.log(message);
        throw err;
    }
}