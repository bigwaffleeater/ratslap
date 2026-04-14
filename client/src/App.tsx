import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/room/:roomCode" element={<LobbyPage />} />
                <Route path="/game/:roomCode" element={<GamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;