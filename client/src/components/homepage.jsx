import { useState } from "react";
import "./css/homepage.css";
import { useLeaderboardStats } from "../api/seasonstats";

function Homepage() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { leaderboardStats, loading, hasMore } = useLeaderboardStats(page, limit);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <div className="homepage-container">
      <h2>2024-25 Statistical Leaders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>PTS</th>
                <th>AST</th>
                <th>TRB</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardStats.map((player, index) => (
                <tr key={player.player_bbrID}>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td className="player-cell">
                    {player.playerObject.headshot_icon ? (
                      <img
                        className="player-image"
                        src={`http://localhost:3000/player/icon/${player.playerObject.headshot_icon}`}
                        alt={`${player.playerObject.name} headshot`}
                      />
                    ) : null}
                    {player.playerObject.name}
                  </td>
                  <td>{player.playerObject.currentTeam}</td>
                  <td>{player.per_game?.pts}</td>
                  <td>{player.per_game?.ast}</td>
                  <td>{player.per_game?.trb}</td>
                  <td>{player.totalContribution.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={page === 1}>Previous</button>
        <span>Page {page}</span>
        <button onClick={handleNext} disabled={!hasMore}>Next</button>
      </div>
    </div>
  );
}

export default Homepage;