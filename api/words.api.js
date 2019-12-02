const wordSchema = require('../models/word.model');
const request = require('request');
const {formatPromiseResult, handleError, promisify, getRandomInt, getAllIndexes, randomWithProbability} = require('../utils');
const DOMParser = require('dom-parser');
const {VOWELS, VOWELS_REGEX} = require('../constants');

function post(wordObj) {
    const newWord = new wordSchema(wordObj);
    return newWord.save();
}

async function get(word) {
    console.log('Entering wordsApi.get!');
    let [err, result] = await formatPromiseResult(wordSchema.findOne({word}))
    handleError(err, `[words.api] checkIfExists: error in finding word: ${word}`);
    if(!result) {
        return false;
    }
    return result;
};

async function saveWords(wordObjects, mood) {
    console.log('Entering wordsApi.saveWords!');
    const promises = [];
    for(let i = 0; i< wordObjects.length; i++) {
        promises.push(saveSingleWord(wordObjects[i], mood));
    }
    await formatPromiseResult(Promise.all(promises));
}

async function saveSingleWord(wordObj, mood) {
    console.log('Entering wordsApi.saveSingleWord!');
    let [err, dbWord] = await formatPromiseResult(get(wordObj.word));
    handleError(err, `[text.api] checkWord: error in saving word: ${wordObj.word}`);
    const found = !!dbWord;
    dbWord = dbWord || wordObj;
    // if there is no emphasis
    if(!dbWord.emphasis) {
        let [err, emphasis] = await formatPromiseResult(getEmphasis(wordObj));
        handleError(err, `[saveWords()] Failed to get emphasis for word ${wordObj.word}`);
        if(emphasis > wordObj.word.length-1) {
            emphasis = -1;
        }
        wordObj.emphasis = emphasis;
    }
    if(found) {
        wordObj.phrases.forEach(phrase => {
            //update phrase matches
            const dbWordMatch = dbWord.phrases.find(p => p.match === phrase.match);
            if(dbWordMatch) {
                dbWordMatch.occasions += phrase.occasions;
                //update mood
                console.log("HALT! dbWordMatch", dbWordMatch, mood);
                if(dbWordMatch.moods && mood) {
                    console.log("moods: ", dbWordMatch.moods)
                    const dbMood = dbWordMatch.moods.find(m => m.mood === mood);
                    if(dbMood) {
                        dbMood.occasions++;
                    }
                    else {
                        dbWordMatch.moods.push({
                            mood: mood,
                            occasions: 1
                        });
                    }
                } else if(mood) {
                    dbWordMatch.moods = [
                        {
                            mood,
                            occasions: 1
                        }
                    ]
                };
            } else {
                dbWord.phrases.push(phrase);
            }
        });
        wordSchema.updateOne({word: dbWord.word},dbWord).then(err=>{console.log("!!!!!: ", err)})
    } else {
        dbWord.phrases = dbWord.phrases.map(phrase => {
            return{
                ...phrase,
                moods: [
                    {
                        mood,
                        occasions: 1
                    }
                ]
            }
        })
        post(dbWord);
    }
}

function cleanWord(word) {
    return word.replace(/[^а-яА-Я ’'"\-іґєїІҐЄЇ]/g, '').trim().toLowerCase();
}

async function getEmphasis(wordObj) {
    console.log('Entering wordsApi.getEmphasis!');
    const word = wordObj.word,
        wordURI = encodeURI(word),
        requestPromise = promisify(request);

    if(countVowels(word) === 0) {
        return 0;
    }
    if(countVowels(word) === 1) {
        return word.search(/[аеєиіїоуюя]/g)
    }
    let err, response, emphasis; 

    [err, response] = await formatPromiseResult(requestPromise(`https://www.slovnyk.ua/?swrd=${wordURI}`));
    if(err || response.error) {
        handleError(err, `Failed to send request to slovnyk.ua for word ${word}`)
    }
    const body = response.body,
        document = new DOMParser().parseFromString(body, "text/html"),
        infinitives = document.getElementsByClassName('text-uppercase'),
        infinitiveWord = cleanWord(infinitives[0].textContent),
        content = document.getElementsByClassName('toggle-content')[0],
        bigWords = content.getElementsByTagName('b');

	for(let i in bigWords) {
		const foundWord = cleanWord(bigWords[i].textContent);
		if(foundWord === infinitiveWord) {
			const children = bigWords[i].childNodes;
			const firstPart = children[0].textContent;
			emphasis = firstPart.length;
			if(word[emphasis] && VOWELS.includes(word[emphasis])){
				wordObj.emphasis = emphasis;
			}
			break;
		}
    }
    return emphasis;
}

function countVowels(word) {
    const match = word.match(/[аеєиіїоуюя]/g)
    return match && match.length;
}

async function generateFirstWord(wordsCount) {
    let err, wordObj;
    const randomIndex = getRandomInt(0, wordsCount-1);
    [err, wordObj] = await formatPromiseResult(wordSchema.findOne().skip(randomIndex));
    handleError(err, `generateFirstWord(): Failed to get word`);
    return wordObj;
}

async function generateNextWord({prevWord, pattern, seeds, mood, surprise, verseLastWords, rhyme}) {
    console.log("in generate", pattern)
    let emphasisIndexes = getAllIndexes(pattern.slice(0, 5), 1),
        suitableWords = [], err, rhymeSearch = pattern.length <= 2,
        rhymeEnding = '';
    const getByPrev = randomWithProbability(100-surprise);

    //find rhyme ending    
    if(rhymeSearch && verseLastWords) {
        const rhymeMap = new Map([
            ['aabb', [1,1,2,2]],
            ['abab', [1,2,1,2]],
            ['abba', [1,2,2,1]],
            ['a0a', [1,0,1]],
            ['0a0a', [0,1,0,1]]
        ]);
        const currentRow = verseLastWords.length,
            mappedRhyme = rhymeMap.get(rhyme),
            currenRhymeIndex = mappedRhyme[currentRow],
            rhymesBefore = mappedRhyme.slice(0, currentRow),
            shouldRhymeIndex = rhymesBefore.indexOf(currenRhymeIndex),
            rhymeWord = verseLastWords[shouldRhymeIndex] || '';
        /*console.log("mappedRhyme", mappedRhyme);
        console.log("currenRhymeIndex", currenRhymeIndex);
        console.log("rhymesBefore", rhymesBefore);
        console.log("shouldRhymeIndex", shouldRhymeIndex);
        console.log("verseLastWords", verseLastWords);
        console.log("rhymeWord", rhymeWord);*/
        rhymeEnding = rhymeWord.length > 1 ? rhymeWord.substring(rhymeWord.length-2, rhymeWord.length) : rhymeWord;
        if(!rhymeWord || !rhymeEnding) {
            rhymeSearch = false
        }
    }    
    if(getByPrev) {
        const suitable = prevWord.phrases.map(phrase => {
            if(rhymeSearch) {
                return phrase.match && new RegExp(`${rhymeEnding}$`).test(phrase.match);
            }
            return phrase.match;
        });
        const query = {
            $and: [
                { word: { $in: suitable } },
                { emphasis: { $in: emphasisIndexes } }
            ]
        };
        [err, suitableWords] = await formatPromiseResult(wordSchema.find(query));
        handleError(err, `generateNextWord(): Failed to get word with emphases ${emphasisIndexes}`)
    }
    if(!suitableWords.length) {
        const and = [{ emphasis: { $in: emphasisIndexes } }];
        and.push(rhymeSearch ? { word: new RegExp(`${rhymeEnding}$`) } : {});
        [err, suitableWords] = await formatPromiseResult(wordSchema.find( { $and: and }) );
        handleError(err, `generateNextWord(): Failed to get word with emphases ${emphasisIndexes}`)
        if(!suitableWords.length) {
            [err, suitableWords] = await formatPromiseResult(wordSchema.find( { emphasis: { $in: emphasisIndexes } }) );
        }
    }
    const randomWordIndex = getRandomInt(0, suitableWords.length-1);
    const suitableWord = suitableWords[randomWordIndex];
    console.log("suitableWord",suitableWord.word);
    return suitableWord;
}


module.exports = {
    cleanWord,
    saveWords,
    countVowels,
    generateFirstWord,
    generateNextWord
};