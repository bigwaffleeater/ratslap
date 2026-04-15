import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";

type PlayerInfo = { id: string; name: string; cardCount: number };
type PileState = {
    size: number;
    topCard: { value: string; suit: string } | null;
};

function isRed(suit: string) {
    return suit === "hearts" || suit === "diamonds";
}

function suitSymbol(suit: string) {
    return {
        hearts: "♥",
        diamonds: "♦",
        clubs: "♣",
        spades: "♠",
    }[suit] ?? suit;
}

function GamePage() {
    const { roomCode } = useParams();
    // const { state } = useLocation();
    const navigate = useNavigate();

    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState("");
    const [pile, setPile] = useState<PileState>({
        size: 0,
        topCard: null,
    });
    const [statusMsg, setStatusMsg] = useState("");
    const [gameOver, setGameOver] = useState<{
        winnerId: string;
        winnerName: string;
    } | null>(null);
    const [myId, setMyId] = useState(() => socket.id ?? "");

    const playersRef = useRef<PlayerInfo[]>([]);
    playersRef.current = players;

    const myInfo = players.find(p => p.id === myId);
    const isMyTurn = currentPlayerId === myId;

    useEffect(() => {
        socket.emit("get-game", roomCode);

        const onGameStarted = (data: {
            players: PlayerInfo[];
            currentPlayerId: string;
            pile: PileState;
        }) => {
            setMyId(socket.id ?? "");
            setPlayers(data.players);
            setCurrentPlayerId(data.currentPlayerId);
            setPile(data.pile);

            const name =
                data.players.find(p => p.id === data.currentPlayerId)?.name ??
                "?";
            setStatusMsg(`${name}'s turn`);
        };

        const onCardPlayed = (data: {
            playerId: string;
            playedCard: { value: string; suit: string };
            currentPlayerId: string;
            pile: PileState;
            players: PlayerInfo[];
            pileWinnerName: string | null;
        }) => {
            setPlayers(data.players);
            setCurrentPlayerId(data.currentPlayerId);
            setPile(data.pile);

            const nextName =
                data.players.find(p => p.id === data.currentPlayerId)?.name ??
                "?";

            if (data.pileWinnerName) {
                setStatusMsg(`${data.pileWinnerName} takes the pile!`);
                setTimeout(() => {
                    setStatusMsg(`${nextName}'s turn`);
                }, 1500);
            } else {
                setStatusMsg(`${nextName}'s turn`);
            }
        };

        const onSlapResult = (data: {
            playerId: string;
            valid: boolean;
            pile: PileState;
            players: PlayerInfo[];
            currentPlayerId?: string;
        }) => {
            setPlayers(data.players);
            setPile(data.pile);

            if (data.currentPlayerId) {
                setCurrentPlayerId(data.currentPlayerId);
            }

            const name =
                data.players.find(p => p.id === data.playerId)?.name ??
                data.playerId.slice(0, 6);

            setStatusMsg(
                data.valid
                    ? `${name} slaps — takes the pile!`
                    : `${name} bad slap — burned a card`
            );
        };

        const onGameOver = (data: {
            winnerId: string;
            winnerName: string;
            players: PlayerInfo[];
        }) => {
            setPlayers(data.players);
            setGameOver({
                winnerId: data.winnerId,
                winnerName: data.winnerName,
            });
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
    }, [roomCode]);

    const playCard = useCallback(() => {
        socket.emit("play-card", roomCode);
    }, [roomCode]);

    const slap = useCallback(() => {
        socket.emit("slap", roomCode);
    }, [roomCode]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                slap();
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [slap]);

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            padding: "20px",
            color: "#fff",
        },
        center: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "20px",
        },
        playerList: {
            display: "flex",
            gap: "10px",
        },
        playerBox: {
            padding: "8px 12px",
            background: "#222",
            borderRadius: "8px",
        },
        me: {
            fontWeight: "bold" as const,
        },
        pileSection: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            margin: "20px 0",
        },
        card: {
            width: "80px",
            height: "120px",
            background: "#fff",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            fontSize: "24px",
        },
        emptyCard: {
            width: "80px",
            height: "120px",
            background: "#444",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        label: {
            margin: "5px",
            fontSize: "14px",
        },
        status: {
            marginTop: "10px",
            fontSize: "18px",
        },
        turn: {
            marginLeft: "10px",
            color: "#0f0",
        },
        controls: {
            display: "flex",
            gap: "10px",
            marginTop: "20px",
        },
        slapBtn: {
            padding: "10px 20px",
            fontSize: "16px",
            background: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
        },
        playBtn: {
            padding: "10px 20px",
            fontSize: "16px",
            background: "#4444ff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
        },
        hand: {
            marginTop: "20px",
        },
        bigText: {
            fontSize: "24px",
            fontWeight: "bold" as const,
        },
        smallText: {
            fontSize: "12px",
            opacity: 0.7,
        },
    };

    if (gameOver) {
        return (
            <div style={styles.center}>
                <h1>Game Over</h1>
                <p style={styles.bigText}>
                    {gameOver.winnerId === myId
                        ? "🏆 You win!"
                        : `${gameOver.winnerName} wins!`}
                </p>
                <button onClick={() => navigate("/")}>
                    Back to lobby
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.playerList}>
                    {players
                        .filter(p => p.id !== myId)
                        .map(p => (
                            <div
                                key={p.id}
                                style={{
                                    ...styles.playerBox,
                                    border:
                                        p.id === currentPlayerId
                                            ? "2px solid #aa3bff"
                                            : "1px solid #ccc",
                                }}
                            >
                                {p.name}{" "}
                                <span style={styles.smallText}>
                                    ({p.cardCount})
                                </span>
                            </div>
                        ))}
                </div>

                <div style={styles.me}>
                    You:{" "}
                    <span style={{ color: "#fff" }}>
                        {myInfo?.name ?? "..."}
                    </span>
                </div>
            </div>

            {/* Pile */}
            <div style={styles.pileSection}>
                <p style={styles.label}>PILE</p>

                {pile.topCard ? (
                    <div
                        style={{
                            ...styles.card,
                            color: isRed(pile.topCard.suit)
                                ? "#D85A30"
                                : "#111",
                        }}
                    >
                        <span>{pile.topCard.value}</span>
                        <span>{suitSymbol(pile.topCard.suit)}</span>
                    </div>
                ) : (
                    <div style={styles.emptyCard}>empty</div>
                )}

                <p style={styles.label}>{pile.size} cards</p>
            </div>

            {/* Status */}
            <p style={styles.status}>
                {statusMsg}
                {isMyTurn && <span style={styles.turn}>your turn</span>}
            </p>

            {/* Buttons */}
            <div style={styles.controls}>
                <button onClick={slap} style={styles.slapBtn}>
                    SLAP
                </button>

                <button
                    onClick={playCard}
                    disabled={!isMyTurn}
                    style={{
                        ...styles.playBtn,
                        opacity: isMyTurn ? 1 : 0.4,
                    }}
                >
                    Play card
                </button>
            </div>

            {/* Hand count */}
            {myInfo && (
                <div style={styles.hand}>
                    <span style={styles.bigText}>
                        {myInfo.cardCount}
                    </span>{" "}
                    cards in hand
                </div>
            )}
        </div>
    );
}

export default GamePage;