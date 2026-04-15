"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.shuffleDeck = shuffleDeck;
exports.dealCards = dealCards;
const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
function createDeck() {
    return SUITS.flatMap(suit => VALUES.map(value => ({ suit, value })));
}
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function dealCards(numPlayers) {
    const deck = shuffleDeck(createDeck());
    const hands = Array.from({ length: numPlayers }, () => []);
    deck.forEach((card, i) => {
        hands[i % numPlayers].push(card);
    });
    return hands;
}
