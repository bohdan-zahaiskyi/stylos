const {VOWELS} = require('./constants');

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

export const promisify = function promisify(f) {
    return function (...args) { // return a wrapper-function
        return new Promise((resolve, reject) => {
            function callback(err, result) { // our custom callback for f
                if (err) {
                    return reject(err);
                } else {
                    resolve(result);
                }
            }

            args.push(callback); // append our custom callback to the end of f arguments

            f.call(this, ...args); // call the original function
        });
    };
};

export const handleError = function(err, message) {
    if(err) {
        console.log(`${message}; \nError:${err.message || err}`);
        throw err;
    }
}

export const getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const forEachPromise = function (items, fn, context) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item, context);
        });
    }, Promise.resolve());
}

export const randomWithProbability = function(procents) {
    const probability = procents/100;
    return Math.random() < probability;
}