"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = exports.EVENTS = void 0;
exports.EVENTS = {
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
};
exports.DEFAULT_SETTINGS = {
    rules: {
        doubles: true,
        sandwiches: true,
        marriage: true,
        topBottom: true
    },
    maxPlayers: 6
};
