import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Homepage from "./components/homepage";
import PlayersPage from "./components/players";
import ForesightPage from "./components/foresight";
import ExplorerPage from "./components/explorer";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-logo">nba.tools</div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/players">Players</Link>
            <Link to="/explorer">Explorer</Link>
            <Link to="/foresight">Foresight</Link>
          </div>
        </nav>

        <div className="body-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/foresight" element={<ForesightPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;