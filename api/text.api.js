//const wordsModel = require('../models/words.model');
const wordsApi = require('./words.api');
const wordSchema = require('../models/word.model');
const mongoose = require('mongoose');
const counterApi = require('./counter.api');
const {formatPromiseResult, handleError, getAllIndexes} = require('../utils');

async function analyzeText(poem) {
    console.log('Entering textApi.analyzeText!');
    const {mood, text, seeds, rhyme, emphasisCount, metre} = poem;
    counterApi.saveCounters({seeds, rhyme, emphases: emphasisCount, metre, mood})
    const allWords = text.split(/[ \n]/g).map(word => wordsApi.cleanWord(word)).filter(word => word);
    const uniqueWords = allWords.filter((word, index, self) => {
        return self.indexOf(self.find(w => w === word)) === index;
    });
    const wordObjects = uniqueWords.map(uniqueWord => {
        const wordIndexes = getAllIndexes(allWords, uniqueWord);
        const phrases = [];

        wordIndexes.forEach(index => {
            if (allWords[index + 1]) {
                const existingMatch = phrases.find(m => m.match === allWords[index + 1])
                if (existingMatch) {
                    existingMatch.occasions++
                } else {
                    phrases.push({
                        match: allWords[index + 1],
                        occasions: 1
                    });
                }
            }
        });
        return {
            word: uniqueWord,
            phrases
        };
    });
    let [err, result] = await formatPromiseResult(wordsApi.saveWords(wordObjects, mood));
    handleError(err, `[text.api]: failed to save words`);
    return wordObjects;
}

async function generatePoem(parameters) {
    const {mood, verses, rows, seeds, rhyme, emphases, metre, surprise} = parameters;
    let poemVerses = [], err, wordsCount;
    [err, wordsCount] = await formatPromiseResult(wordSchema.countDocuments());
    handleError(err, `generatePoem(): Failed to get words count`);
    for(let i of Array(verses)) {
        const poemRows = [],
            verseLastWords = [];
        let rowLastWord = '';
        
        const firstWord = await wordsApi.generateFirstWord(wordsCount);
        for(let j of  Array(rows).fill(1)) {
            const rowFirstWord = rowLastWord ? rowLastWord: firstWord;
            console.log("HALT! rowFirstWord: ", j, rowFirstWord);
            const row = await generateRow({rowFirstWord, seeds, rhyme, metre, mood, emphases, surprise, verseLastWords});
            rowLastWord = row[row.length-1];
            verseLastWords.push(rowLastWord);
            poemRows.push(row);
        }
        poemVerses.push(poemRows);
    }
    let poem = '';
    poemVerses.forEach(verse => {
        verse.forEach(row => {
            poem += row.map(wordObj => wordObj.word).join(' ');
            poem +='\n';
        });
        poem +='\n';
    })
    console.log("POEM: ", poem);
    return poem;
}

async function generateRow({rowFirstWord, seeds, rhyme, metre, mood, emphases, surprise, verseLastWords}) {
    const pattern = generatePattern(metre, emphases),
        originalPattern = [...pattern],
        row = [];
    let vowelsFilled = wordsApi.countVowels(rowFirstWord.word),
        prevWord = rowFirstWord;
        
    pattern.splice(0, vowelsFilled);
    for (let i of originalPattern) {
        if(pattern.length < 1) {
            break;
        }
        let[err, nextWord] = await formatPromiseResult(wordsApi.generateNextWord({
            prevWord, pattern, seeds, mood, surprise, verseLastWords, rhyme
        }));
        handleError(err, `[textApi.generateRow()]: Failed to generate next word after ${prevWord.word}`);

        row.push(nextWord);
        vowelsFilled = wordsApi.countVowels(nextWord.word);
        prevWord = nextWord;
        pattern.splice(0, vowelsFilled);
    }
    return row;
}

function generatePattern(metre, emphases) {
    const pattern = [];
    const patternMap = new Map([
        ['iamb', [0,1]],
        ['throchee', [1,0]],
        ['anapest', [0,0,1]],
        ['dactyl', [1,0,0]],
        ['amphibrach', [0,1,0]]
    ]);
    const metreCounter = patternMap.get(metre);
    for(let i = 0; i<emphases; i++) {
        pattern.push(...metreCounter);
    }
    return pattern;
}

module.exports = {
    analyzeText,
    generatePoem,
    generatePattern
}