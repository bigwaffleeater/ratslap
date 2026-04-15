"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pile = void 0;
class Pile {
    constructor() {
        this.cards = [];
    }
    // Add card to top
    push(card) {
        this.cards.push(card);
    }
    // peek at top card
    peekTop() {
        return this.cards[this.cards.length - 1] ?? null;
    }
    // Peek at bottom card
    peekBottom() {
        return this.cards[0] ?? null;
    }
    // Remove from top
    popTop() {
        return this.cards.pop() ?? null;
    }
    // Remove from bottom
    popBottom() {
        return this.cards.shift() ?? null;
    }
    // Get last N cards from top — used by slap rules
    last(n) {
        return this.cards.slice(-n);
    }
    // Player wins the pile — take all cards
    takeAll() {
        return this.cards.splice(0);
    }
    get size() {
        return this.cards.length;
    }
    isEmpty() {
        return this.cards.length === 0;
    }
    // For sending to client — only expose top card
    peekState() {
        return {
            topCard: this.peekTop(),
            size: this.size
        };
    }
}
exports.Pile = Pile;
