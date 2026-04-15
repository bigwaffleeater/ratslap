export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
    suit: Suit;
    value: Value;
}

export interface Player {
    id: string;
    name: string;
    turnOrder: number;
    hand: Card[];
    isConnected: boolean;
}

export interface RoomSettings {
    rules: {
        doubles: boolean;
        sandwiches: boolean;
        marriage: boolean;
        topBottom: boolean;
    };
    maxPlayers: number;
}

export interface Room {
    id: string;
    hostId: string;
    players: Player[];
    status: "lobby" | "playing" | "finished";
    settings: RoomSettings;
}

export const EVENTS = {
    CREATE_ROOM: "create-room",
    JOIN_ROOM: "join-room",
    START_GAME: "start-game",
    PLAY_CARD: "play-card",
    SLAP: "slap",
    ROOM_CREATED: "room-created",
    ROOM_UPDATED: "room-updated",
    GAME_STARTED: "game-started",
    CARD_PLAYED: "card-played",
    SLAP_RESULT: "slap-result",
    GAME_OVER: "game-over"
} as const;

export const DEFAULT_SETTINGS: RoomSettings = {
    rules: {
        doubles: true,
        sandwiches: true,
        marriage: true,
        topBottom: true
    },
    maxPlayers: 6
};