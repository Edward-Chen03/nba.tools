import React, { useState, useEffect, Fragment } from "react";
import { useAlphabetPlayerStats, fetchPlayerSeasons } from "../api/seasonstats";
import "./css/player.css";
import StatsTable from "./def/playertables"; 

function PlayersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const limit = 15;

  const [seasonsData, setSeasonsData] = useState({});
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  
  const [expandedSeasons, setExpandedSeasons] = useState({});

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const { playerStats, loading, hasMore } = useAlphabetPlayerStats(page, limit, search);

  const handlePrev = () => { if (page > 1) setPage(prev => prev - 1); };
  const handleNext = () => { if (hasMore) setPage(prev => prev + 1); };

  const handlePlayerClick = async (bbrID) => {
    if (expandedPlayer === bbrID) {
      setExpandedPlayer(null);
      return;
    }

    setExpandedPlayer(bbrID);
    setExpandedSeasons({}); 

    if (!seasonsData[bbrID]) {
      setSeasonsData(prev => ({ ...prev, [bbrID]: { loading: true } }));
      try {
        const apiResponse = await fetchPlayerSeasons(bbrID);
        const seasonsArray = apiResponse.seasons;
        setSeasonsData(prev => ({ ...prev, [bbrID]: { loaded: true, seasons: seasonsArray } }));
      } catch (error) {
        setSeasonsData(prev => ({ ...prev, [bbrID]: { error: true, message: "Failed to load seasons." } }));
      }
    }
  };

  const handleSeasonClick = (playerId, seasonId) => {
    const currentExpandedForPlayer = expandedSeasons[playerId] || [];
    const isCurrentlyExpanded = currentExpandedForPlayer.includes(seasonId);

    let newExpandedForPlayer;

    if (isCurrentlyExpanded) {
      newExpandedForPlayer = currentExpandedForPlayer.filter(id => id !== seasonId);
    } else {
      newExpandedForPlayer = [...currentExpandedForPlayer, seasonId];
    }

    setExpandedSeasons(prev => ({
      ...prev,
      [playerId]: newExpandedForPlayer
    }));
  };

  return (
    <div className="players-page-container">
      <h2>Browse Players</h2>
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search players by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {loading && page === 1 ? (
        <p>Loading...</p>
      ) : (
        <div className="players-table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="header-number">#</th>
                <th className="header-player">Player</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((player, index) => (
                <Fragment key={player.bbrID}>
                  <tr className="clickable-row" onClick={() => handlePlayerClick(player.bbrID)}>
                    <td className="right-align">{(page - 1) * limit + index + 1}</td>
                    <td className="player-cell">
                      <img
                        className="player-image"
                        src={`http://localhost:3000/player/icon/${player.headshot_icon}`}
                        alt={`${player.name} headshot`}
                        onError={(e) => { e.target.style.visibility = 'hidden'; }}
                      />
                      <span>{player.name}</span>
                    </td>
                    <td>{player.currentTeam}</td>
                  </tr>

                  {expandedPlayer === player.bbrID && (
                    <tr className="expanded-row">
                      <td colSpan="3">
                        <div className="expanded-content">
                          {seasonsData[player.bbrID]?.loading && <p>Loading seasons...</p>}
                          {seasonsData[player.bbrID]?.error && <p>{seasonsData[player.bbrID].message}</p>}
                          {seasonsData[player.bbrID]?.loaded && Array.isArray(seasonsData[player.bbrID].seasons) && (
                             <ul className="seasons-list">
                              {seasonsData[player.bbrID].seasons.map(season => (
                                <li key={season.season} className="season-item">
                                  <div className="season-header" onClick={() => handleSeasonClick(player.bbrID, season.season)}>
                                    <strong>{season.season}</strong> - {season.team} - {season.position}
                                  </div>
                                  {expandedSeasons[player.bbrID]?.includes(season.season) && (
                                    <div className="season-stats-details">
                        
                                      <StatsTable title="Per Game" stats={season.per_game} />
                                      <StatsTable title="Totals" stats={season.totals} />
                                      <StatsTable title="Advanced" stats={season.advanced} />
                                      <StatsTable title="Per 100" stats={season.per100poss} />
                                      <StatsTable title="Shooting" stats={season.shooting} />
                                      
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={page === 1 || loading}>Previous</button>
        <span>Page {page}</span>
        <button onClick={handleNext} disabled={!hasMore || loading}>Next</button>
      </div>
    </div>
  );
}

export default PlayersPage;