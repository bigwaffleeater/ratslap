import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Vite's default port
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});