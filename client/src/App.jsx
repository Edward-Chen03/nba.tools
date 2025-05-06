import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [perGamePlayers, setPlayers] = useState([]);
  
  useEffect(() => {
    
    fetch('http://localhost:3000/seasons/2024-2025')
      .then(response => response.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching season data:', error);
        setLoading(false);
      });
  }, []);

  console.log(perGamePlayers)

  return (
    <div className="app">
    
      <nav className="navbar">
        <div className="navbar-logo">nba.tools</div>
        <div className="navbar-links">
        <a> Players </a>
        <a> Stats </a>
        <a> Explorer </a>
        <a> Login </a>
        </div>
      </nav>

      <div className="body-content">
        <p> 2024-25 Statistical Leaders </p>
        <button onClick={() => setCount(count + 1)}>Count is {count}</button>
      </div>

    </div>
  );
}

export default App;
