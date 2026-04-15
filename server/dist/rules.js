"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDouble = isDouble;
exports.isSandwich = isSandwich;
exports.isMarriage = isMarriage;
exports.isTopBottom = isTopBottom;
exports.isFaceCard = isFaceCard;
exports.getChallengeAttempts = getChallengeAttempts;
exports.validateSlap = validateSlap;
function isDouble(pile) {
    if (pile.size < 2)
        return false;
    const [second, top] = pile.last(2);
    return top.value === second.value;
}
function isSandwich(pile) {
    if (pile.size < 3)
        return false;
    const [bottom, , top] = pile.last(3);
    return top.value === bottom.value;
}
function isMarriage(pile) {
    if (pile.size < 2)
        return false;
    const [second, top] = pile.last(2);
    const values = new Set([top.value, second.value]);
    return values.has("K") && values.has("Q");
}
function isTopBottom(pile) {
    if (pile.size < 2)
        return false;
    return pile.peekTop().value === pile.peekBottom().value;
}
function isFaceCard(value) {
    return ["J", "Q", "K", "A"].includes(value);
}
function getChallengeAttempts(value) {
    const attempts = {
        "A": 4, "K": 3, "Q": 2, "J": 1
    };
    return attempts[value] ?? 0;
}
function validateSlap(pile, settings) {
    return ((settings.rules.doubles && isDouble(pile)) ||
        (settings.rules.sandwiches && isSandwich(pile)) ||
        (settings.rules.marriage && isMarriage(pile)) ||
        (settings.rules.topBottom && isTopBottom(pile)));
}
