import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlayerSeasons } from "../api/seasonstats";
import { fetchPlayer } from "../api/playerobjects";
import StatsTable from "./def/playertables";
import "./css/playerprofile.css";
import { Box, Paper, Typography, Button, CircularProgress, Chip } from "@mui/material";

function ProfilePage() {
    const { bbrID } = useParams();
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [playerInfo, setPlayerInfo] = useState(null);
    const [expandedSeasons, setExpandedSeasons] = useState({});
    const [expandedOnOff, setExpandedOnOff] = useState({});
    const [expandedLineups, setExpandedLineups] = useState({});
    const [expandedLineupSeasons, setExpandedLineupSeasons] = useState({});
    const [expandedGames, setExpandedGames] = useState({});
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setInitialLoad(true);
            try {
                const response = await fetchPlayerSeasons(bbrID);
                const playerProfile = await fetchPlayer(bbrID);
                setSeasons(response.seasons || []);
                console.log(playerProfile)
                if (response.seasons?.length > 0) {
                    setPlayerInfo({
                        name: playerProfile.name || "Player",
                        headshot: playerProfile.headshot_icon || "",
                        colleges: [playerProfile.colleges],
                        team: playerProfile.currentTeam,
                        age: Math.floor((new Date() - new Date(playerProfile.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)),
                        height: `${Math.floor(playerProfile.height / 12)}'${playerProfile.height % 12}"`,
                        weight: `${playerProfile.weight} lbs`,
                    });
                }
            } catch (err) {
                setError("Failed to load player data.");
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        };

        fetchData();
    }, [bbrID]);

    if (initialLoad || loading || !playerInfo) {
        return (
            <div className="player-details-page loading-page">
                <Box className="loading-container">
                    <CircularProgress sx={{ color: '#ffffff', size: 60 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', mt: 2 }}>
                        Loading player data...
                    </Typography>
                </Box>
            </div>
        );
    }

    if (error) {
        return (
            <div className="player-details-page">
                <Box className="error-container">
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate(-1)}
                        className="back-button-error"
                    >
                        ← Back to Search
                    </Button>
                </Box>
            </div>
        );
    }

    const toggleSeason = (index) => {
        setExpandedSeasons((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const toggleOnOff = (seasonIndex) => {
        setExpandedOnOff((prev) => ({
            ...prev,
            [seasonIndex]: !prev[seasonIndex],
        }));
    };

    const toggleLineups = (seasonIndex) => {
        setExpandedLineups((prev) => ({
            ...prev,
            [seasonIndex]: !prev[seasonIndex],
        }));
    };

    const toggleLineupSeason = (seasonIndex, seasonType) => {
        const key = `${seasonIndex}-${seasonType}`;
        setExpandedLineupSeasons((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleGames = (seasonIndex) => {
        setExpandedGames((prev) => ({
            ...prev,
            [seasonIndex]: !prev[seasonIndex],
        }));
    };

    return (
        <div className="player-details-page">
            <Button 
                variant="contained" 
                onClick={() => navigate(-1)}
                className="back-button"
                startIcon="←"
            >
                Back to Search
            </Button>

            <Box className="player-header-section">
                <Box className="player-avatar-section">
                    {playerInfo.headshot && (
                        <div className="player-image-wrapper">
                            <img
                                className="player-profile-image"
                                src={`http://localhost:3000/player/icon/${playerInfo.headshot}`}
                                alt={`${playerInfo.name} headshot`}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                </Box>

                <Box className="player-info-card">
                    <Typography variant="h3" className="player-name">
                        {playerInfo.name}
                    </Typography>
                    
                    <Box className="player-stats-grid">
                        <Box className="stat-item">
                            <Typography variant="body2" className="stat-label">Team</Typography>
                            <Chip 
                                label={playerInfo.team || "N/A"} 
                                className="team-chip"
                                variant="filled"
                            />
                        </Box>
                        
                        <Box className="stat-item">
                            <Typography variant="body2" className="stat-label">Age</Typography>
                            <Typography variant="h6" className="stat-value">
                                {playerInfo.age || "N/A"}
                            </Typography>
                        </Box>
                        
                        <Box className="stat-item">
                            <Typography variant="body2" className="stat-label">Height</Typography>
                            <Typography variant="h6" className="stat-value">
                                {playerInfo.height || "N/A"}
                            </Typography>
                        </Box>
                        
                        <Box className="stat-item">
                            <Typography variant="body2" className="stat-label">Weight</Typography>
                            <Typography variant="h6" className="stat-value">
                                {playerInfo.weight || "N/A"}
                            </Typography>
                        </Box>
                        
                        <Box className="stat-item">
                            <Typography variant="body2" className="stat-label">College</Typography>
                            <Typography variant="body1" className="stat-value">
                                {playerInfo.colleges || "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {seasons.length > 0 && (
                <Box className="seasons-section">
                    <Typography variant="h4" className="seasons-title">
                        Career Statistics
                    </Typography>
                    
                    <Box className="seasons-container">
                        {seasons.map((season, index) => (
                            <Paper key={`${season.season}-${season.team}-${index}`} className="season-card" elevation={3}>
                                <Box 
                                    className="season-header" 
                                    onClick={() => toggleSeason(index)}
                                >
                                    <Box className="season-info">
                                        <Typography variant="h6" className="season-year">
                                            {season.season}
                                        </Typography>
                                        <Box className="season-details">
                                            <Chip 
                                                label={season.team} 
                                                className="season-team-chip"
                                                size="small"
                                            />
                                            <Chip 
                                                label={season.position} 
                                                className="season-position-chip"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>
                                    
                                    <Box className="toggle-button">
                                        {expandedSeasons[index] ? "▲" : "▼"}
                                    </Box>
                                </Box>
                                
                                {expandedSeasons[index] && (
                                    <Box className="stats-tables-container">
                                        <Box className="tables-grid">
                                            <StatsTable title="Per Game" stats={season.per_game} />
                                            <StatsTable title="Totals" stats={season.totals} />
                                            <StatsTable title="Advanced" stats={season.advanced} />
                                            <StatsTable title="Per 100 Possessions" stats={season.per100poss} />
                                            <StatsTable title="Shooting" stats={season.shooting} />
                                        </Box>

                                        {season.games && season.games.length > 0 && (
                                            <Box className="expandable-section">
                                                <Box 
                                                    className="expandable-header"
                                                    onClick={() => toggleGames(index)}
                                                >
                                                    <Typography variant="h6" className="expandable-title">
                                                        Game Log ({season.games.length} games)
                                                    </Typography>
                                                    <Box className="expandable-toggle">
                                                        {expandedGames[index] ? "▲" : "▼"}
                                                    </Box>
                                                </Box>

                                                {expandedGames[index] && (
                                                    <Box className="expandable-content">
                                                        <Box className="games-table-container">
                                                            <div className="stats-table">
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Date</th>
                                                                            <th>Opponent</th>
                                                                            <th>Home/Away</th>
                                                                            <th>Result</th>
                                                                            <th>Started</th>
                                                                            <th>MIN</th>
                                                                            <th>FG</th>
                                                                            <th>FGA</th>
                                                                            <th>FG%</th>
                                                                            <th>3P</th>
                                                                            <th>3PA</th>
                                                                            <th>3P%</th>
                                                                            <th>FT</th>
                                                                            <th>FTA</th>
                                                                            <th>FT%</th>
                                                                            <th>ORB</th>
                                                                            <th>DRB</th>
                                                                            <th>TRB</th>
                                                                            <th>AST</th>
                                                                            <th>STL</th>
                                                                            <th>BLK</th>
                                                                            <th>TOV</th>
                                                                            <th>PF</th>
                                                                            <th>PTS</th>
                                                                            <th>+/-</th>
                                                                            <th>GmSc</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {season.games.map((game, gameIndex) => (
                                                                            <tr key={gameIndex}>
                                                                                <td>{game.date || 'N/A'}</td>
                                                                                <td>{game.opponent || 'N/A'}</td>
                                                                                <td>
                                                                                    <span className={`home-away-indicator ${game.home === '@' ? 'home' : 'away'}`}>
                                                                                        {game.home === '@' ? 'Home' : 'Away'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    <span className={`game-result ${game.result && game.result.startsWith('W') ? 'win' : 'loss'}`}>
                                                                                        {game.result || 'N/A'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    <span className={`started-indicator ${game.started ? 'started' : 'bench'}`}>
                                                                                        {game.started ? 'Started' : 'Bench'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>{game.mp || '0:00'}</td>
                                                                                <td>{game.fg !== null && game.fg !== undefined ? game.fg : '0'}</td>
                                                                                <td>{game.fga !== null && game.fga !== undefined ? game.fga : '0'}</td>
                                                                                <td>{game.fgp !== null && game.fgp !== undefined ? game.fgp.toFixed(3) : '0.000'}</td>
                                                                                <td>{game.threep !== null && game.threep !== undefined ? game.threep : '0'}</td>
                                                                                <td>{game.threepa !== null && game.threepa !== undefined ? game.threepa : '0'}</td>
                                                                                <td>{game.threepap !== null && game.threepap !== undefined ? game.threepap.toFixed(3) : '0.000'}</td>
                                                                                <td>{game.ft !== null && game.ft !== undefined ? game.ft : '0'}</td>
                                                                                <td>{game.fta !== null && game.fta !== undefined ? game.fta : '0'}</td>
                                                                                <td>
                                                                                    {(() => {
                                                                                        const ft = game.ft || 0;
                                                                                        const fta = game.fta || 0;
                                                                                        if (fta === 0) return '0.000';
                                                                                        return (ft / fta).toFixed(3);
                                                                                    })()}
                                                                                </td>
                                                                                <td>{game.orb !== null && game.orb !== undefined ? game.orb : '0'}</td>
                                                                                <td>{game.drb !== null && game.drb !== undefined ? game.drb : '0'}</td>
                                                                                <td>{game.trb !== null && game.trb !== undefined ? game.trb : '0'}</td>
                                                                                <td>{game.ast !== null && game.ast !== undefined ? game.ast : '0'}</td>
                                                                                <td>{game.stl !== null && game.stl !== undefined ? game.stl : '0'}</td>
                                                                                <td>{game.blk !== null && game.blk !== undefined ? game.blk : '0'}</td>
                                                                                <td>{game.tov !== null && game.tov !== undefined ? game.tov : '0'}</td>
                                                                                <td>{game.pf !== null && game.pf !== undefined ? game.pf : '0'}</td>
                                                                                <td>{game.pts !== null && game.pts !== undefined ? game.pts : '0'}</td>
                                                                                <td>
                                                                                    <span className={`plus-minus ${parseFloat(game.plus_minus || 0) >= 0 ? 'positive' : 'negative'}`}>
                                                                                        {game.plus_minus || '0'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>{game.gmsc !== null ? game.gmsc.toFixed(1) : '0.0'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {season.onoff && season.onoff.length > 0 && (
                                            <Box className="expandable-section">
                                                <Box 
                                                    className="expandable-header"
                                                    onClick={() => toggleOnOff(index)}
                                                >
                                                    <Typography variant="h6" className="expandable-title">
                                                        On/Off Court Stats
                                                    </Typography>
                                                    <Box className="expandable-toggle">
                                                        {expandedOnOff[index] ? "▲" : "▼"}
                                                    </Box>
                                                </Box>

                                                {expandedOnOff[index] && (
                                                    <Box className="expandable-content">

                                                        {season.onoff[0] && season.onoff[0].post && season.onoff[0].post.length > 0 && (
                                                            <div>
                                                                <Typography variant="h6" className="stats-section-title">
                                                                    Post Season On/Off
                                                                </Typography>
                                                                <div className="stats-table">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                {Object.keys(season.onoff[0].post[0]).map(key => (
                                                                                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {season.onoff[0].post.map((row, rowIndex) => (
                                                                                <tr key={rowIndex}>
                                                                                    {Object.values(row).map((value, colIndex) => (
                                                                                        <td key={colIndex}>{value}</td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {season.onoff[0] && season.onoff[0].reg && season.onoff[0].reg.length > 0 && (
                                                            <div>
                                                                <Typography variant="h6" className="stats-section-title">
                                                                    Regular Season On/Off
                                                                </Typography>
                                                                <div className="stats-table">
                                                                    <table>
                                                                        <thead>
                                                                            <tr>
                                                                                {Object.keys(season.onoff[0].reg[0]).map(key => (
                                                                                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {season.onoff[0].reg.map((row, rowIndex) => (
                                                                                <tr key={rowIndex}>
                                                                                    {Object.values(row).map((value, colIndex) => (
                                                                                        <td key={colIndex}>{value}</td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                 
                                        {season.lineups && season.lineups.length > 0 && (
                                            <Box className="expandable-section">
                                                <Box 
                                                    className="expandable-header"
                                                    onClick={() => toggleLineups(index)}
                                                >
                                                    <Typography variant="h6" className="expandable-title">
                                                        Lineup Statistics
                                                    </Typography>
                                                    <Box className="expandable-toggle">
                                                        {expandedLineups[index] ? "▲" : "▼"}
                                                    </Box>
                                                </Box>

                                                {expandedLineups[index] && (
                                                    <Box className="expandable-content">

                                                        {(() => {
                                                            const hasPostLineups = season.lineups[0]?.post && 
                                                                ['2man', '3man', '4man', '5man'].some(type => 
                                                                    season.lineups[0].post[type] && season.lineups[0].post[type].length > 0
                                                                );
                                                            const hasRegLineups = season.lineups[0]?.reg && 
                                                                ['2man', '3man', '4man', '5man'].some(type => 
                                                                    season.lineups[0].reg[type] && season.lineups[0].reg[type].length > 0
                                                                );
                                                            
                                                            if (!hasPostLineups && !hasRegLineups) {
                                                                return (
                                                                    <Box className="no-lineups-message">
                                                                        <Typography variant="body1" className="no-data-text">
                                                                            No lineups found for this season.
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <>
                                    
                                                                    {hasPostLineups && (
                                                                        <Box className="lineup-season-section">
                                                                            <Box 
                                                                                className="lineup-season-header"
                                                                                onClick={() => toggleLineupSeason(index, 'post')}
                                                                            >
                                                                                <Typography variant="h6" className="lineup-season-title">
                                                                                    Post Season Lineups
                                                                                </Typography>
                                                                                <Box className="lineup-season-toggle">
                                                                                    {expandedLineupSeasons[`${index}-post`] ? "▲" : "▼"}
                                                                                </Box>
                                                                            </Box>
                                                                            
                                                                            {expandedLineupSeasons[`${index}-post`] && (
                                                                                <Box className="lineup-season-content">
                                                                                    {['2man', '3man', '4man', '5man'].map(lineupType => (
                                                                                        season.lineups[0].post[lineupType] && season.lineups[0].post[lineupType].length > 0 && (
                                                                                            <Box key={lineupType} className="lineup-type-section">
                                                                                                <Box className="lineup-type-header-static">
                                                                                                    <Typography variant="subtitle1" className="lineup-type-title">
                                                                                                        {lineupType.charAt(0).toUpperCase() + lineupType.slice(1)} Lineups
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                                
                                                                                                <Box className="lineup-table-container">
                                                                                                    <div className="stats-table">
                                                                                                        <table>
                                                                                                            <thead>
                                                                                                                <tr>
                                                                                                                    {Object.keys(season.lineups[0].post[lineupType][0]).map(key => (
                                                                                                                        <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                                                                                                    ))}
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                {season.lineups[0].post[lineupType].map((row, rowIndex) => (
                                                                                                                    <tr key={rowIndex}>
                                                                                                                        {Object.values(row).map((value, colIndex) => (
                                                                                                                            <td key={colIndex}>{value}</td>
                                                                                                                        ))}
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>
                                                                                                </Box>
                                                                                            </Box>
                                                                                        )
                                                                                    ))}
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    )}

                                                                    {hasRegLineups && (
                                                                        <Box className="lineup-season-section">
                                                                            <Box 
                                                                                className="lineup-season-header"
                                                                                onClick={() => toggleLineupSeason(index, 'reg')}
                                                                            >
                                                                                <Typography variant="h6" className="lineup-season-title">
                                                                                    Regular Season Lineups
                                                                                </Typography>
                                                                                <Box className="lineup-season-toggle">
                                                                                    {expandedLineupSeasons[`${index}-reg`] ? "▲" : "▼"}
                                                                                </Box>
                                                                            </Box>
                                                                            
                                                                            {expandedLineupSeasons[`${index}-reg`] && (
                                                                                <Box className="lineup-season-content">
                                                                                    {['2man', '3man', '4man', '5man'].map(lineupType => (
                                                                                        season.lineups[0].reg[lineupType] && season.lineups[0].reg[lineupType].length > 0 && (
                                                                                            <Box key={lineupType} className="lineup-type-section">
                                                                                                <Box className="lineup-type-header-static">
                                                                                                    <Typography variant="subtitle1" className="lineup-type-title">
                                                                                                        {lineupType.charAt(0).toUpperCase() + lineupType.slice(1)} Lineups
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                                
                                                                                                <Box className="lineup-table-container">
                                                                                                    <div className="stats-table">
                                                                                                        <table>
                                                                                                            <thead>
                                                                                                                <tr>
                                                                                                                    {Object.keys(season.lineups[0].reg[lineupType][0]).map(key => (
                                                                                                                        <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                                                                                                    ))}
                                                                                                                </tr>
                                                                                                            </thead>
                                                                                                            <tbody>
                                                                                                                {season.lineups[0].reg[lineupType].map((row, rowIndex) => (
                                                                                                                    <tr key={rowIndex}>
                                                                                                                        {Object.values(row).map((value, colIndex) => (
                                                                                                                            <td key={colIndex}>{value}</td>
                                                                                                                        ))}
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </div>
                                                                                                </Box>
                                                                                            </Box>
                                                                                        )
                                                                                    ))}
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}
        </div>
    );
}

export default ProfilePage;