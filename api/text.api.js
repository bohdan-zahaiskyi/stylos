const wordsModel = require('../models/words.model');
const wordsApi = require('./words.api');
const mongoose = require('mongoose');

async function analyzeText(poem) {
    const allWords = poem.split(' ').map(word => wordsApi.cleanWord(word)).filter(word => word);
    const uniqueWords = allWords.filter((word, index, self) => {
        return self.indexOf( self.find(w => w === word)) === index;
    });
    const wordObjects = uniqueWords.map(uniqueWord => {
        const wordIndexes = getAllIndexes(words, uniqueWord);
        const matches = [];
        wordIndexes.forEach(index => {
          if(words[index+1]) {
            const existingMatch = matches.find(m => m.match === words[index+1])
            if(existingMatch) {
              existingMatch.occasions++
            } else {
              matches.push({
                match: words[index+1],
                occasions: 1
              });
            }
          }
        });
        return {
          word: uniqueWord,
          matches
        }
      })
    /*
        1. треба найти всі унікальні слова
        2. зробити пари по 2 і по три слова
        3. зберегти в бд
    
    */
    const lines = poem.split('\n');
    const phrases = lines.map(line => {
        const words = line.split(' '),
            linePhrases = [];

        for(let i = 0; i< words.length; i++) {
            if(words[i+1]) {
                linePhrases.push(`${wordsApi.cleanWord(words[i])} ${wordsApi.cleanWord(words[i+1])}`);
            }
        }
    });
}


/*
    let [err, exists] = await formatPromiseResult(checkIfExists(wordObj));
    handleError(err, `[words.api] checkWord: error in checking if word: ${wordObj.word} exists`);
    if(exists) {
        return exists;
    }
    [err] = await formatPromiseResult(post(wordObj));
    handleError(err, `[words.api] checkWord: error in saving word: ${wordObj.word}`);
*/