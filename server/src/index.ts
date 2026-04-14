// index.ts

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Room } from "../../shared/types";
import {
    GameState, createRoom, generateRoomCode,
    startGame, playCard, handleSlap,
    checkWinner
} from "./gameState";

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory store
const rooms = new Map<string, Room>();
const gameStates = new Map<string, GameState>();

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create room
    socket.on("create-room", (playerName: string) => {
        const roomCode = generateRoomCode();
        const room = createRoom(roomCode, socket.id, playerName);
        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.emit("room-created", room);
        console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    // Join room
    socket.on("join-room", ({ roomCode, playerName }: { roomCode: string, playerName: string }) => {
        const room = rooms.get(roomCode);
        if (!room) return socket.emit("error", "Room not found");
        if (room.status !== "lobby") return socket.emit("error", "Game already started");
        if (room.players.length >= room.settings.maxPlayers) return socket.emit("error", "Room full");

        room.players.push({
            id: socket.id,
            name: playerName,
            turnOrder: room.players.length,
            hand: [],
            isConnected: true
        });

        socket.join(roomCode);
        io.to(roomCode).emit("room-updated", room);
        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Start game
    socket.on("start-game", (roomCode: string) => {
    console.log(`Start game attempt — room: ${roomCode}, socket: ${socket.id}`);
    const room = rooms.get(roomCode);
    if (!room) {
        console.log(`Room not found: ${roomCode}`);
        return socket.emit("error", "Room not found");
    }
    console.log(`Host ID: ${room.hostId}, Socket ID: ${socket.id}`);
    if (room.hostId !== socket.id) {
        console.log(`Not host — rejecting`);
        return socket.emit("error", "Only host can start");
    }
    if (room.players.length < 2) {
        console.log(`Not enough players`);
        return socket.emit("error", "Need at least 2 players");
    }

    const state = startGame(room);
    gameStates.set(roomCode, state);
    io.to(roomCode).emit("game-started", {
        players: state.room.players.map(p => ({
            id: p.id,
            name: p.name,
            cardCount: p.hand.length
        })),
        currentPlayerId: state.currentPlayerId,
        pile: state.pile.peekState()
    });
    console.log(`Game started in room ${roomCode}`);
});

    // Play card
    socket.on("play-card", (roomCode: string) => {
        try {
            const state = gameStates.get(roomCode);
            if (!state) return socket.emit("error", "Game not found");

            console.log(`\n--- Play attempt by ${socket.id} ---`);
            console.log(`Challenge active: ${state.challenge.isActive}`);
            if (state.challenge.isActive) {
                console.log(`Challenger: ${state.challenge.challengerId}`);
                console.log(`Challenged: ${state.challenge.challengedId}`);
                console.log(`Attempts remaining: ${state.challenge.attemptsRemaining}`);
            }
            console.log(`Current player: ${state.currentPlayerId}`);
            console.log(`Card counts: ${state.room.players.map(p => `${p.name}(${p.hand.length})`).join(", ")}`);

            const actingPlayer = state.room.players.find(p => p.id === socket.id);
            if (!actingPlayer) {
                console.log(`REJECTED — player not found`);
                return socket.emit("error", "Player not found");
            }

            // Snapshot BEFORE playCard mutates state
            const playedCard = actingPlayer.hand[0];
            const countsBefore = state.room.players.map(p => ({
                id: p.id,
                cardCount: p.hand.length
            }));

const result = playCard(state, socket.id);
if (!result) {
    console.log(`REJECTED — not their turn`);
    return socket.emit("error", "Not your turn");
}

console.log(`Card counts after: ${state.room.players.map(p => `${p.name}(${p.hand.length})`).join(", ")}`);

// Detect pile winner by count jump
let pileWinnerId: string | null = null;
let pileWinnerName: string | null = null;

for (const p of state.room.players) {
    const before = countsBefore.find(x => x.id === p.id)?.cardCount ?? 0;
    const after = p.hand.length;

    if (after > before + 1) {
        pileWinnerId = p.id;
        pileWinnerName = p.name;
        break;
    }
}

io.to(roomCode).emit("card-played", {
    playerId: socket.id,
    playedCard,
    currentPlayerId: state.currentPlayerId,
    pile: state.pile.peekState(),
    players: state.room.players.map(p => ({
        id: p.id,
        name: p.name,
        cardCount: p.hand.length
    })),
    pileWinnerId,
    pileWinnerName
});

            // After card-played emit
            const winner = checkWinner(state);
            if (winner) {
                io.to(roomCode).emit("game-over", {
                    winnerId: winner.id,
                    winnerName: winner.name,
                    players: state.room.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        cardCount: p.hand.length
                    }))
                });
                gameStates.delete(roomCode);
                rooms.delete(roomCode);
            }
        } catch (err) {
            console.error("Error in play-card:", err);
            socket.emit("error", "Server error");
        }
    });

    // Slap
    socket.on("slap", (roomCode: string) => {
        try {
            const state = gameStates.get(roomCode);
            if (!state) return socket.emit("error", "Game not found");

            console.log(`\n--- Slap attempt by ${socket.id} ---`);
            console.log(`Pile size: ${state.pile.size}`);
            console.log(`Card counts: ${state.room.players.map(p => `${p.name}(${p.hand.length})`).join(", ")}`);

            const result = handleSlap(state, socket.id);

            if (result.valid) {
                console.log(`VALID SLAP — ${socket.id} wins the pile`);
            } else {
                console.log(`INVALID SLAP — ${socket.id} burns a card`);
            }
            console.log(`Card counts after: ${state.room.players.map(p => `${p.name}(${p.hand.length})`).join(", ")}`);

            io.to(roomCode).emit("slap-result", {
                playerId: socket.id,
                valid: result.valid,
                winnerId: result.winnerId,
                currentPlayerId: state.currentPlayerId,
                pile: state.pile.peekState(),
                players: state.room.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    cardCount: p.hand.length
                }))
            });
            // After card-played emit
            const winner = checkWinner(state);
            if (winner) {
                io.to(roomCode).emit("game-over", {
                    winnerId: winner.id,
                    winnerName: winner.name,
                    players: state.room.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        cardCount: p.hand.length
                    }))
                });
                gameStates.delete(roomCode);
                rooms.delete(roomCode);
            }
        } catch (err) {
            console.error("Error in slap:", err);
            socket.emit("error", "Server error");
        }
    });

    socket.on("get-game", (roomCode: string) => {
    const state = gameStates.get(roomCode);
    if (!state) return;
    socket.join(roomCode);
    socket.emit("game-started", {
        players: state.room.players.map(p => ({
            id: p.id,
            name: p.name,
            cardCount: p.hand.length
        })),
        currentPlayerId: state.currentPlayerId,
        pile: state.pile.peekState()
    });
});

    socket.on("get-room", (roomCode: string) => {
        const room = rooms.get(roomCode);
        if (room) socket.emit("room-updated", room);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        rooms.forEach((room, code) => {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.isConnected = false;
                io.to(code).emit("room-updated", room);
            }
        });
    });
});


const PORT = 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});