const counterSchema = require('../models/counter.model');
const {formatPromiseResult, handleError} = require('../utils');

function saveCounters(params) {
    console.log("Entering counterApi.saveCounters()");
    const keys = params.keys;
    let promises = [];
    for(let i in keys) {
        promises.push(findAndUpdateCounter(keys[i], params[keys[i]]))
    }
    Promise.all(promises);
}

async function findAndUpdateCounter(key, value) {
    let [err, counter] = await formatPromiseResult(counterSchema.findOne({value: key}));
    let found = false;
    handleError(err, `[counter.api]: Failed to get counters`);
    for(let i in counter.values) {
        if(counter.values[i].key === value) {
            counter.values[i].occuranses++;
            found = true;
            break;
        }
    };
    if(!found) {
        counter.values.push({
            key: value,
            occuranses: 1
        })
    }
    counterSchema.updateOne({_id: counter._id}, counter);
}

module.exports = {
    saveCounters
}