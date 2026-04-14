import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

function LandingPage() {
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const createRoom = () => {
        if (!name.trim()) return setError("Enter your name");
        socket.emit("create-room", name);
        socket.once("room-created", (room) => {
            navigate(`/room/${room.id}`, { state: { name, isHost: true, players: room.players } });
        });
    };

    const joinRoom = () => {
        if (!name.trim()) return setError("Enter your name");
        if (!roomCode.trim()) return setError("Enter a room code");
        socket.emit("join-room", { roomCode: roomCode.toUpperCase(), playerName: name });
        socket.once("room-updated", (room) => {
            navigate(`/room/${roomCode.toUpperCase()}`, { state: { name, isHost: false, players: room.players } });
        });
        socket.once("error", (msg) => setError(msg));
    };

    const inputStyle = {
        padding: "10px",
        width: "100%",
        marginBottom: "12px",
        height: "42px",
        boxSizing: "border-box" as const,
        borderRadius: "6px",
    };

    const buttonStyle = {
        width: "100%",
        height: "42px",
        marginBottom: "12px",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
    };

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", maxWidth: "400px", margin: "0 auto" }}>
            <h1>🃏 Ratslap</h1>
            <p>Egyptian Ratscrew — online multiplayer</p>
            <div style={{ marginBottom: "20px" }}>
                <input
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={createRoom} style={buttonStyle}>
                    Create Game
                </button>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <input
                    placeholder="Room code"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    style={inputStyle}
                />
                <button onClick={joinRoom} style={{ padding: "10px 20px", width: "100%" }}>
                    Join Game
                </button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default LandingPage;