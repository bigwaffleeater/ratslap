import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";

type PlayerInfo = { id: string; name: string; cardCount: number };
type PileState = { size: number; topCard: { value: string; suit: string } | null };

function isRed(suit: string) {
    return suit === "hearts" || suit === "diamonds";
}

function suitSymbol(suit: string) {
    return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit] ?? suit;
}

function GamePage() {
    const { roomCode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState("");
    const [pile, setPile] = useState<PileState>({ size: 0, topCard: null });
    const [statusMsg, setStatusMsg] = useState("");
    const [gameOver, setGameOver] = useState<{ winnerId: string; winnerName: string } | null>(null);
    const [myId, setMyId] = useState(() => socket.id ?? "");

    const playersRef = useRef<PlayerInfo[]>([]);
    playersRef.current = players;

    const myInfo = players.find(p => p.id === myId);
    const isMyTurn = currentPlayerId === myId;

    useEffect(() => {
        socket.emit("get-game", roomCode);

        const onGameStarted = (data: { players: PlayerInfo[]; currentPlayerId: string; pile: PileState }) => {
            console.log("game-started received, socket.id:", socket.id);
            console.log("data.currentPlayerId:", data.currentPlayerId);
            console.log("data.players:", data.players.map(p => `${p.name}:${p.id}`));
            setMyId(socket.id ?? "");
            setPlayers(data.players);
            setCurrentPlayerId(data.currentPlayerId);
            setPile(data.pile);
            setStatusMsg(`${data.players.find(p => p.id === data.currentPlayerId)?.name ?? "?"}'s turn`);
        };

        const onCardPlayed = (data: {
            playerId: string;
            playedCard: { value: string; suit: string };
            currentPlayerId: string;
            pile: PileState;
            players: PlayerInfo[];
            pileWinnerId: string | null;
            pileWinnerName: string | null;
        }) => {
            setPlayers(data.players);
            setCurrentPlayerId(data.currentPlayerId);
            setPile(data.pile);
            const nextName = data.players.find(p => p.id === data.currentPlayerId)?.name ?? "?";
            if (data.pileWinnerName) {
                setStatusMsg(`${data.pileWinnerName} takes the pile!`);
                setTimeout(() => setStatusMsg(`${nextName}'s turn`), 1500);
            } else {
                setStatusMsg(`${nextName}'s turn`);
            }
        };

        const onSlapResult = (data: {
            playerId: string;
            valid: boolean;
            winnerId?: string;
            pile: PileState;
            players: PlayerInfo[];
            currentPlayerId?: string;
        }) => {
            setPlayers(data.players);
            setPile(data.pile);
            if (data.currentPlayerId) setCurrentPlayerId(data.currentPlayerId);
            const slapperName = data.players.find(p => p.id === data.playerId)?.name ?? data.playerId.slice(0, 6);
            if (data.valid) {
                setStatusMsg(`${slapperName} slaps — takes the pile!`);
            } else {
                setStatusMsg(`${slapperName} bad slap — burned a card`);
            }
        };

        const onGameOver = (data: { winnerId: string; winnerName: string; players: PlayerInfo[] }) => {
            setPlayers(data.players);
            setGameOver({ winnerId: data.winnerId, winnerName: data.winnerName });
        };

        socket.on("game-started", onGameStarted);
        socket.on("card-played", onCardPlayed);
        socket.on("slap-result", onSlapResult);
        socket.on("game-over", onGameOver);

        return () => {
            socket.off("game-started", onGameStarted);
            socket.off("card-played", onCardPlayed);
            socket.off("slap-result", onSlapResult);
            socket.off("game-over", onGameOver);
        };
    }, []);

    const playCard = useCallback(() => {
        socket.emit("play-card", roomCode);
    }, [roomCode]);

    const slap = useCallback(() => {
        socket.emit("slap", roomCode);
    }, [roomCode]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space") { e.preventDefault(); slap(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [slap]);

    if (gameOver) {
        return (
            <div style={{ padding: "40px", fontFamily: "monospace", textAlign: "center" }}>
                <h1>Game Over</h1>
                <p style={{ fontSize: "24px", margin: "20px 0" }}>
                    {gameOver.winnerId === myId ? "🏆 You win!" : `${gameOver.winnerName} wins!`}
                </p>
                <button onClick={() => navigate("/")} style={{ padding: "10px 24px", marginTop: "16px" }}>
                    Back to lobby
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", padding: "24px 16px", fontFamily: "monospace", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "20px",
    }}
>
    <div
        style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            flex: 1,
        }}
    >
        {players.filter(p => p.id !== myId).map(p => (
            <div
                key={p.id}
                style={{
                    padding: "6px 14px",
                    border: p.id === currentPlayerId ? "2px solid #aa3bff" : "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "13px",
                }}
            >
                {p.name}{" "}
                <span style={{ fontSize: "11px", color: "#888" }}>
                    ({p.cardCount})
                </span>
            </div>
        ))}
    </div>

    <div
        style={{
            fontSize: "13px",
            color: "#888",
            whiteSpace: "nowrap",
            textAlign: "right",
            marginTop: "6px",
        }}
    >
        You: <span style={{ color: "#fff" }}>{myInfo?.name ?? "..."}</span>
    </div>
</div>
            <div style={{ margin: "20px 0" }}>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>PILE</p>
                {pile.topCard ? (
                    <div style={{
                        width: "80px", height: "112px",
                        border: "1px solid #ccc", borderRadius: "8px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        margin: "0 auto",
                        color: isRed(pile.topCard.suit) ? "#D85A30" : "#111",
                        fontSize: "28px", fontWeight: 500,
                        background: "#fff"
                    }}>
                        <span>{pile.topCard.value}</span>
                        <span style={{ fontSize: "20px" }}>{suitSymbol(pile.topCard.suit)}</span>
                    </div>
                ) : (
                    <div style={{
                        width: "80px", height: "112px",
                        border: "2px dashed #ccc", borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto", color: "#aaa", fontSize: "12px"
                    }}>empty</div>
                )}
                <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>{pile.size} cards</p>
            </div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px", minHeight: "18px" }}>
                {statusMsg}
                {isMyTurn && <span style={{ marginLeft: "8px", background: "#EEEDFE", color: "#3C3489", borderRadius: "99px", padding: "2px 10px", fontSize: "11px" }}>your turn</span>}
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <button onClick={slap} style={{
                    width: "160px", height: "56px",
                    background: "#FCEBEB", color: "#A32D2D",
                    border: "1px solid #f0a0a0", borderRadius: "10px",
                    fontSize: "18px", fontWeight: 500, cursor: "pointer"
                }}>
                    SLAP
                </button>
                <button onClick={playCard} disabled={!isMyTurn} style={{
                    width: "160px", height: "44px",
                    background: isMyTurn ? "#fff" : "#f5f5f5",
                    border: "1px solid #ccc", borderRadius: "8px",
                    fontSize: "15px", cursor: isMyTurn ? "pointer" : "not-allowed",
                    opacity: isMyTurn ? 1 : 0.4,
                    color: "#111"
                }}>
                    Play card
                </button>
            </div>
            {myInfo && (
                <div style={{ marginTop: "24px", fontSize: "13px", color: "#888" }}>
                    <span style={{ fontSize: "22px", fontWeight: 500, color: "#fff" }}>{myInfo.cardCount}</span> cards in hand
                </div>
            )}
        </div>
    );
}

export default GamePage;