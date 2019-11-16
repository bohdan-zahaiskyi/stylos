const wordSchema = require('../models/word.model');
const {formatPromiseResult, handleError} = require('utils');

function post(wordObj) {
    const newWord = new wordSchema(wordObj);
    return await formatPromiseResult(newWord.save())
}

async function checkIfExists(word) {
    let [err, result] = await formatPromiseResult(wordSchema.find({word}))
    handleError(err, `[words.api] checkIfExists: error in finding word: ${word}`);
    return !!result && result[0]._id;
};

function cleanWord(word) {
    return word.replace(/[^а-яА-Я ’'"\-іґєїІҐЄЇ]/g, '').trim().toLowerCase();
}