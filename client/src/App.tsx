import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to server:", socket.id);
            setConnected(true);
        });

        socket.on("connect_error", (err) => {
            console.log("Connection error:", err.message);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
        };
    }, []);

    return (
        <div>
            <h1>Ratslap</h1>
            <p>Status: {connected ? "Connected" : "Disconnected"}</p>
        </div>
    );
}

export default App;