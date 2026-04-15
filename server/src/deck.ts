import { Card, Suit, Value } from "./shared-types";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const VALUES: Value[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

export function createDeck(): Card[] {
    return SUITS.flatMap(suit =>
        VALUES.map(value => ({ suit, value }))
    );
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function dealCards(numPlayers: number): Card[][] {
    const deck = shuffleDeck(createDeck());
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
    deck.forEach((card, i) => {
        hands[i % numPlayers].push(card);
    });
    return hands;
}