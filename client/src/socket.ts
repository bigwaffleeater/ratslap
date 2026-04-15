import { io } from "socket.io-client";

// Safe way to get the URL that works with TypeScript
const getSocketUrl = () => {
    // Check if we're in Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
    // Fallback for production or when env var is not set
    return "https://ratslap-production.up.railway.app";
};

const url = getSocketUrl();
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