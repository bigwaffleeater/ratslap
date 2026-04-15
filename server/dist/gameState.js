"use strict";
// gameState.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.generateRoomCode = generateRoomCode;
exports.getNextPlayerId = getNextPlayerId;
exports.startGame = startGame;
exports.playCard = playCard;
exports.handleSlap = handleSlap;
exports.checkWinner = checkWinner;
const types_1 = require("../../shared/types");
const deck_1 = require("./deck");
const pile_1 = require("./pile");
const rules_1 = require("./rules");
function createRoom(roomCode, hostId, hostName) {
    return {
        id: roomCode,
        hostId,
        players: [{
                id: hostId,
                name: hostName,
                turnOrder: 0,
                hand: [],
                isConnected: true
            }],
        status: "lobby",
        settings: types_1.DEFAULT_SETTINGS
    };
}
function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function getNextPlayerId(players, currentId) {
    const current = players.find(p => p.id === currentId);
    let nextOrder = current.turnOrder;
    for (let i = 0; i < players.length; i++) {
        nextOrder = (nextOrder + 1) % players.length;
        const nextPlayer = players.find(p => p.turnOrder === nextOrder);
        if (nextPlayer.hand.length > 0) {
            return nextPlayer.id;
        }
    }
    return currentId;
}
function startGame(room) {
    const hands = (0, deck_1.dealCards)(room.players.length);
    room.players.forEach((p, i) => p.hand = hands[i]);
    room.status = "playing";
    return {
        room,
        pile: new pile_1.Pile(),
        currentPlayerId: room.players[0].id,
        challenge: {
            isActive: false,
            challengerId: "",
            challengedId: "",
            attemptsRemaining: 0
        }
    };
}
function playCard(state, playerId) {
    // During a challenge, only the challenged player can play
    if (state.challenge.isActive) {
        if (state.challenge.challengedId !== playerId)
            return null;
    }
    else {
        // Normal turn enforcement
        if (state.currentPlayerId !== playerId)
            return null;
    }
    const player = state.room.players.find(p => p.id === playerId);
    // If challenged player has no cards left, challenger wins pile
    if (player.hand.length === 0) {
        if (state.challenge.isActive && state.challenge.challengedId === playerId) {
            const challengerId = state.challenge.challengerId;
            const challenger = state.room.players.find(p => p.id === challengerId);
            challenger.hand.push(...state.pile.takeAll());
            state.currentPlayerId = challengerId;
            state.challenge = {
                isActive: false,
                challengerId: "",
                challengedId: "",
                attemptsRemaining: 0
            };
            return state;
        }
        return null;
    }
    // Play top card from hand onto pile
    const card = player.hand.shift();
    state.pile.push(card);
    // Handle challenge state
    if (state.challenge.isActive) {
        if ((0, rules_1.isFaceCard)(card.value)) {
            // Reset challenge to next player
            const nextId = getNextPlayerId(state.room.players, playerId);
            state.challenge = {
                isActive: true,
                challengerId: playerId,
                challengedId: nextId,
                attemptsRemaining: (0, rules_1.getChallengeAttempts)(card.value)
            };
            state.currentPlayerId = nextId;
            return state;
        }
        else {
            if (state.challenge.attemptsRemaining === 1) {
                // Last attempt used up, no face card — challenger wins pile
                const challengerId = state.challenge.challengerId;
                const challenger = state.room.players.find(p => p.id === challengerId);
                challenger.hand.push(...state.pile.takeAll());
                state.currentPlayerId = challengerId;
                state.challenge = {
                    isActive: false,
                    challengerId: "",
                    challengedId: "",
                    attemptsRemaining: 0
                };
                return state;
            }
            else {
                // Same challenged player keeps going
                state.challenge.attemptsRemaining--;
                state.currentPlayerId = playerId;
                return state;
            }
        }
    }
    else if ((0, rules_1.isFaceCard)(card.value)) {
        // Start new challenge
        const nextId = getNextPlayerId(state.room.players, playerId);
        state.challenge = {
            isActive: true,
            challengerId: playerId,
            challengedId: nextId,
            attemptsRemaining: (0, rules_1.getChallengeAttempts)(card.value)
        };
        state.currentPlayerId = nextId;
        return state;
    }
    // Normal turn advance
    state.currentPlayerId = getNextPlayerId(state.room.players, playerId);
    return state;
}
function handleSlap(state, playerId) {
    if ((0, rules_1.validateSlap)(state.pile, state.room.settings)) {
        // Valid slap — player takes the pile
        const winner = state.room.players.find(p => p.id === playerId);
        winner.hand.push(...state.pile.takeAll());
        // Reset challenge
        state.challenge = {
            isActive: false,
            challengerId: "",
            challengedId: "",
            attemptsRemaining: 0
        };
        // Winner leads next
        state.currentPlayerId = playerId;
        return { valid: true, winnerId: playerId };
    }
    else {
        // Invalid slap — burn a card to the pile
        const player = state.room.players.find(p => p.id === playerId);
        if (player.hand.length > 0) {
            state.pile.push(player.hand.shift());
        }
        return { valid: false };
    }
}
function checkWinner(state) {
    const activePlayers = state.room.players.filter(p => p.hand.length > 0);
    if (activePlayers.length === 1) {
        return activePlayers[0];
    }
    return null;
}
