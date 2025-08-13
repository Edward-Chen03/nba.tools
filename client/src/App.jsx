import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Homepage from "./components/homepage";
import PlayersPage from "./components/players";
import ForesightPage from "./components/foresight";
import ExplorerPage from "./components/explorer";
import ProfilePage from './components/playerprofile';
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const isPlayersPage = location.pathname === '/players';
  const isNonScrollablePage = isHomepage || isPlayersPage;

  useEffect(() => {
    if (isNonScrollablePage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isNonScrollablePage]);

  return (
    <div className={`app ${isNonScrollablePage ? 'homepage-route' : ''}`}>
      <nav className="navbar">
        <div className="navbar-logo">nba.tools</div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/players">Players</Link>
          <Link to="/explorer">Explorer</Link>
          <Link to="/foresight">Foresight</Link>
        </div>
      </nav>

      <div className={`body-content ${isNonScrollablePage ? 'homepage-content' : ''}`}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/foresight" element={<ForesightPage />} />
          <Route path="/player/:bbrID" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;