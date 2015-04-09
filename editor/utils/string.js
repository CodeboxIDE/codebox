/**
 *  Scores a string against another string.
 *      score('Hello World', 'he');     //=> 0.5931818181818181
 *      score('Hello World', 'Hello');  //=> 0.7318181818181818
 */
var score = function(string, word, fuzziness) {
    // If the string is equal to the word, perfect match.
    if (string == word) return 1;

    //if it's not a perfect match and is empty return 0
    if( word == "") return 0;

    var runningScore = 0,
            charScore,
            finalScore,
            lString = string.toLowerCase(),
            strLength = string.length,
            lWord = word.toLowerCase(),
            wordLength = word.length,
            idxOf,
            startAt = 0,
            fuzzies = 1,
            fuzzyFactor;

    // Cache fuzzyFactor for speed increase
    if (fuzziness) fuzzyFactor = 1 - fuzziness;

    // Walk through word and add up scores.
    // Code duplication occurs to prevent checking fuzziness inside for loop
    if (fuzziness) {
        for (var i = 0; i < wordLength; ++i) {

            // Find next first case-insensitive match of a character.
            idxOf = lString.indexOf(lWord[i], startAt);

            if (-1 === idxOf) {
                fuzzies += fuzzyFactor;
                continue;
            } else if (startAt === idxOf) {
                // Consecutive letter & start-of-string Bonus
                charScore = 0.7;
            } else {
                charScore = 0.1;

                // Acronym Bonus
                // Weighing Logic: Typing the first character of an acronym is as if you
                // preceded it with two perfect character matches.
                if (string[idxOf - 1] === ' ') charScore += 0.8;
            }

            // Same case bonus.
            if (string[idxOf] === word[i]) charScore += 0.1;

            // Update scores and startAt position for next round of indexOf
            runningScore += charScore;
            startAt = idxOf + 1;
        }
    } else {
        for (var i = 0; i < wordLength; ++i) {

            idxOf = lString.indexOf(lWord[i], startAt);

            if (-1 === idxOf) {
                return 0;
            } else if (startAt === idxOf) {
                charScore = 0.7;
            } else {
                charScore = 0.1;
                if (string[idxOf - 1] === ' ') charScore += 0.8;
            }

            if (string[idxOf] === word[i]) charScore += 0.1;

            runningScore += charScore;
            startAt = idxOf + 1;
        }
    }

    // Reduce penalty for longer strings.
    finalScore = 0.5 * (runningScore / strLength  + runningScore / wordLength) / fuzzies;

    if ((lWord[0] === lString[0]) && (finalScore < 0.85)) {
        finalScore += 0.15;
    }

    return finalScore;
};

var endsWith = function(s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
};

module.exports = {
    'score': score,
    'endsWith': endsWith
};
