import { Pile } from "./pile";
import { RoomSettings } from "./shared-types";

export function isDouble(pile: Pile): boolean {
    if (pile.size < 2) return false;
    const [second, top] = pile.last(2);
    return top.value === second.value;
}

export function isSandwich(pile: Pile): boolean {
    if (pile.size < 3) return false;
    const [bottom, , top] = pile.last(3);
    return top.value === bottom.value;
}

export function isMarriage(pile: Pile): boolean {
    if (pile.size < 2) return false;
    const [second, top] = pile.last(2);
    const values = new Set([top.value, second.value]);
    return values.has("K") && values.has("Q");
}

export function isTopBottom(pile: Pile): boolean {
    if (pile.size < 2) return false;
    return pile.peekTop()!.value === pile.peekBottom()!.value;
}

export function isFaceCard(value: string): boolean {
    return ["J", "Q", "K", "A"].includes(value);
}

export function getChallengeAttempts(value: string): number {
    const attempts: Record<string, number> = {
        "A": 4, "K": 3, "Q": 2, "J": 1
    };
    return attempts[value] ?? 0;
}

export function validateSlap(pile: Pile, settings: RoomSettings): boolean {
    return (
        (settings.rules.doubles && isDouble(pile)) ||
        (settings.rules.sandwiches && isSandwich(pile)) ||
        (settings.rules.marriage && isMarriage(pile)) ||
        (settings.rules.topBottom && isTopBottom(pile))
    );
}