import { Card } from "../../shared/types";

export class Pile {
    private cards: Card[] = [];

    // Add card to top
    push(card: Card): void {
        this.cards.push(card);
    }

    // peek at top card
    peekTop(): Card | null {
        return this.cards[this.cards.length - 1] ?? null;
    }

    // Peek at bottom card
    peekBottom(): Card | null {
        return this.cards[0] ?? null;
    }

    // Remove from top
    popTop(): Card | null {
        return this.cards.pop() ?? null;
    }

    // Remove from bottom
    popBottom(): Card | null {
        return this.cards.shift() ?? null;
    }

    // Get last N cards from top — used by slap rules
    last(n: number): Card[] {
        return this.cards.slice(-n);
    }

    // Player wins the pile — take all cards
    takeAll(): Card[] {
        return this.cards.splice(0);
    }

    get size(): number {
        return this.cards.length;
    }

    isEmpty(): boolean {
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