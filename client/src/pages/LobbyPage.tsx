import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";

function LobbyPage() {
    const { roomCode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
    const [myId, setMyId] = useState(socket.id ?? "");

    const hostId = players[0]?.id;
    const isHost = myId === hostId;

    useEffect(() => {
        if (!socket.id) {
            socket.once("connect", () => setMyId(socket.id!));
        }

        if (state?.players) {
            setPlayers(state.players);
        }

        socket.emit("get-room", roomCode);

        const onRoomUpdated = (room: any) => {
            setPlayers(room.players);
        };

        const onGameStarted = (data: any) => {
            navigate(`/game/${roomCode}`, { state: { ...state, myId: socket.id } });
        };

        socket.on("room-updated", onRoomUpdated);
        socket.on("game-started", onGameStarted);

        return () => {
            socket.off("room-updated", onRoomUpdated);
            socket.off("game-started", onGameStarted);
        };
    }, []);

    const startGame = () => {
        socket.emit("start-game", roomCode);
    };

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", maxWidth: "400px", margin: "0 auto" }}>
            <h1>🃏 Ratslap</h1>
            <h2>Room: {roomCode}</h2>
            <p>Share this code with friends to join!</p>
            <h3>Players ({players.length}):</h3>
            <ul>
                {players.map((p) => (
                    <li key={p.id}>
                        {p.name} {p.id === hostId ? "(host)" : ""}
                    </li>
                ))}
            </ul>
            {isHost && players.length >= 2 && (
                <button onClick={startGame} style={{ padding: "10px 20px", marginTop: "20px" }}>
                    Start Game
                </button>
            )}
            {isHost && players.length < 2 && (
                <p>Waiting for at least one more player...</p>
            )}
            {!isHost && (
                <p>Waiting for host to start...</p>
            )}
        </div>
    );
}

export default LobbyPage;