import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
console.log("🔌 Connecting to Socket.IO server at:", url);

export const socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("✅ Socket.IO connected! ID:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO connection error:", error);
});

socket.on("disconnect", (reason) => {
    console.log("🔌 Socket.IO disconnected:", reason);
});