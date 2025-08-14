import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlayerSeasons } from "../api/seasonstats";
import { fetchPlayer, PLAYER_ICON_URL } from "../api/playerobjects";
import StatsTable from "./def/playertables";
import "./css/playerprofile.css";
import { Box, Paper, Typography, Button, CircularProgress, Chip } from "@mui/material";

const LINEUP_TYPES = ['2man', '3man', '4man', '5man'];
const SEASON_TYPES = ['reg', 'post'];

const GAME_LOG_HEADERS = [
    'Date', 'Opponent', 'Home/Away', 'Result', 'Started', 'MIN', 'FG', 'FGA', 'FG%',
    '3P', '3PA', '3P%', 'FT', 'FTA', 'FT%', 'ORB', 'DRB', 'TRB', 'AST', 'STL',
    'BLK', 'TOV', 'PF', 'PTS', '+/-', 'GmSc'
];

function ProfilePage() {
    const { bbrID } = useParams();
    const navigate = useNavigate();

    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [playerInfo, setPlayerInfo] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
  
    const [expandedSeasons, setExpandedSeasons] = useState({});
    const [expandedOnOff, setExpandedOnOff] = useState({});
    const [expandedLineups, setExpandedLineups] = useState({});
    const [expandedLineupSeasons, setExpandedLineupSeasons] = useState({});
    const [expandedGames, setExpandedGames] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setInitialLoad(true);
            
            try {
                const [seasonsResponse, playerProfile] = await Promise.all([
                    fetchPlayerSeasons(bbrID),
                    fetchPlayer(bbrID)
                ]);

                setSeasons(seasonsResponse.seasons || []);
                
                if (seasonsResponse.seasons?.length > 0) {
                    setPlayerInfo(createPlayerInfo(playerProfile));
                }
            } catch (err) {
                console.error("Error fetching player data:", err);
                setError("Failed to load player data.");
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        };

        if (bbrID) {
            fetchData();
        }
    }, [bbrID]);

    const createPlayerInfo = (playerProfile) => {
        const calculateAge = (birthDate) => {
            if (!birthDate) return null;
            return Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
        };

        const formatHeight = (height) => {
            if (!height) return null;
            return `${Math.floor(height / 12)}'${height % 12}"`;
        };

        const formatWeight = (weight) => {
            return weight ? `${weight} lbs` : null;
        };

        return {
            name: playerProfile.name || "Player",
            headshot: playerProfile.headshot_icon || "",
            colleges: playerProfile.colleges || "N/A",
            team: playerProfile.currentTeam || "N/A",
            age: calculateAge(playerProfile.birthDate),
            height: formatHeight(playerProfile.height),
            weight: formatWeight(playerProfile.weight),
        };
    };

    const createToggleFunction = (setter) => (key) => {
        setter(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSeason = createToggleFunction(setExpandedSeasons);
    const toggleOnOff = createToggleFunction(setExpandedOnOff);
    const toggleLineups = createToggleFunction(setExpandedLineups);
    const toggleGames = createToggleFunction(setExpandedGames);

    const toggleLineupSeason = (seasonIndex, seasonType) => {
        const key = `${seasonIndex}-${seasonType}`;
        setExpandedLineupSeasons(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const formatGameStat = (value, type = 'number') => {
        if (value === null || value === undefined) return '0';
        
        switch (type) {
            case 'percentage':
                return typeof value === 'number' ? value.toFixed(3) : '0.000';
            case 'decimal':
                return typeof value === 'number' ? value.toFixed(1) : '0.0';
            case 'time':
                return value || '0:00';
            default:
                return value.toString();
        }
    };

    const calculateFreeThrowPercentage = (ft, fta) => {
        if (!fta || fta === 0) return '0.000';
        return (ft / fta).toFixed(3);
    };

    const getGameResultClass = (result) => {
        return result && result.startsWith('W') ? 'win' : 'loss';
    };

    const getPlusMinusClass = (plusMinus) => {
        return parseFloat(plusMinus || 0) >= 0 ? 'positive' : 'negative';
    };

    const renderGameLogRow = (game, gameIndex) => (
        <tr key={gameIndex}>
            <td>{game.date || 'N/A'}</td>
            <td>{game.opponent || 'N/A'}</td>
            <td>
                <span className={`home-away-indicator ${game.home === '@' ? 'home' : 'away'}`}>
                    {game.home === '@' ? 'Home' : 'Away'}
                </span>
            </td>
            <td>
                <span className={`game-result ${getGameResultClass(game.result)}`}>
                    {game.result || 'N/A'}
                </span>
            </td>
            <td>
                <span className={`started-indicator ${game.started ? 'started' : 'bench'}`}>
                    {game.started ? 'Started' : 'Bench'}
                </span>
            </td>
            <td>{formatGameStat(game.mp, 'time')}</td>
            <td>{formatGameStat(game.fg)}</td>
            <td>{formatGameStat(game.fga)}</td>
            <td>{formatGameStat(game.fgp, 'percentage')}</td>
            <td>{formatGameStat(game.threep)}</td>
            <td>{formatGameStat(game.threepa)}</td>
            <td>{formatGameStat(game.threepap, 'percentage')}</td>
            <td>{formatGameStat(game.ft)}</td>
            <td>{formatGameStat(game.fta)}</td>
            <td>{calculateFreeThrowPercentage(game.ft, game.fta)}</td>
            <td>{formatGameStat(game.orb)}</td>
            <td>{formatGameStat(game.drb)}</td>
            <td>{formatGameStat(game.trb)}</td>
            <td>{formatGameStat(game.ast)}</td>
            <td>{formatGameStat(game.stl)}</td>
            <td>{formatGameStat(game.blk)}</td>
            <td>{formatGameStat(game.tov)}</td>
            <td>{formatGameStat(game.pf)}</td>
            <td>{formatGameStat(game.pts)}</td>
            <td>
                <span className={`plus-minus ${getPlusMinusClass(game.plus_minus)}`}>
                    {game.plus_minus || '0'}
                </span>
            </td>
            <td>{formatGameStat(game.gmsc, 'decimal')}</td>
        </tr>
    );

    const renderStatsTable = (data, title) => {
        if (!data || data.length === 0) return null;

        const headers = Object.keys(data[0]);
        
        return (
            <div>
                <Typography variant="h6" className="stats-section-title">
                    {title}
                </Typography>
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                {headers.map(key => (
                                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
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
        );
    };

    const renderExpandableSection = (title, isExpanded, onToggle, children, count = null) => (
        <Box className="expandable-section">
            <Box className="expandable-header" onClick={onToggle}>
                <Typography variant="h6" className="expandable-title">
                    {title} {count && `(${count})`}
                </Typography>
                <Box className="expandable-toggle">
                    {isExpanded ? "▲" : "▼"}
                </Box>
            </Box>
            {isExpanded && (
                <Box className="expandable-content">
                    {children}
                </Box>
            )}
        </Box>
    );

    const renderLineupSection = (seasonIndex, seasonType, lineups) => {
        const key = `${seasonIndex}-${seasonType}`;
        const title = `${seasonType === 'post' ? 'Post' : 'Regular'} Season Lineups`;
        
        return (
            <Box className="lineup-season-section" key={seasonType}>
                <Box 
                    className="lineup-season-header"
                    onClick={() => toggleLineupSeason(seasonIndex, seasonType)}
                >
                    <Typography variant="h6" className="lineup-season-title">
                        {title}
                    </Typography>
                    <Box className="lineup-season-toggle">
                        {expandedLineupSeasons[key] ? "▲" : "▼"}
                    </Box>
                </Box>
                
                {expandedLineupSeasons[key] && (
                    <Box className="lineup-season-content">
                        {LINEUP_TYPES.map(lineupType => {
                            const lineupData = lineups[lineupType];
                            if (!lineupData || lineupData.length === 0) return null;

                            return (
                                <Box key={lineupType} className="lineup-type-section">
                                    <Box className="lineup-type-header-static">
                                        <Typography variant="subtitle1" className="lineup-type-title">
                                            {lineupType.charAt(0).toUpperCase() + lineupType.slice(1)} Lineups
                                        </Typography>
                                    </Box>
                                    <Box className="lineup-table-container">
                                        {renderStatsTable(lineupData, '')}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    const hasLineupData = (lineups, seasonType) => {
        return lineups?.[seasonType] && LINEUP_TYPES.some(type => 
            lineups[seasonType][type] && lineups[seasonType][type].length > 0
        );
    };

    // Loading and error states
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
                                src={`${PLAYER_ICON_URL}${playerInfo.headshot}`}
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
                                label={playerInfo.team} 
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
                                {playerInfo.colleges}
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

                                        {season.games && season.games.length > 0 && 
                                            renderExpandableSection(
                                                "Game Log",
                                                expandedGames[index],
                                                () => toggleGames(index),
                                                <Box className="games-table-container">
                                                    <div className="stats-table">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    {GAME_LOG_HEADERS.map(header => (
                                                                        <th key={header}>{header}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {season.games.map(renderGameLogRow)}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Box>,
                                                `${season.games.length} games`
                                            )
                                        }

                                        {season.onoff && season.onoff.length > 0 &&
                                            renderExpandableSection(
                                                "On/Off Court Stats",
                                                expandedOnOff[index],
                                                () => toggleOnOff(index),
                                                <>
                                                    {season.onoff[0]?.post && season.onoff[0].post.length > 0 &&
                                                        renderStatsTable(season.onoff[0].post, "Post Season On/Off")
                                                    }
                                                    {season.onoff[0]?.reg && season.onoff[0].reg.length > 0 &&
                                                        renderStatsTable(season.onoff[0].reg, "Regular Season On/Off")
                                                    }
                                                </>
                                            )
                                        }

                                        {season.lineups && season.lineups.length > 0 &&
                                            renderExpandableSection(
                                                "Lineup Statistics",
                                                expandedLineups[index],
                                                () => toggleLineups(index),
                                                (() => {
                                                    const hasPostLineups = hasLineupData(season.lineups[0], 'post');
                                                    const hasRegLineups = hasLineupData(season.lineups[0], 'reg');
                                                    
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
                                                            {hasPostLineups && 
                                                                renderLineupSection(index, 'post', season.lineups[0].post)
                                                            }
                                                            {hasRegLineups && 
                                                                renderLineupSection(index, 'reg', season.lineups[0].reg)
                                                            }
                                                        </>
                                                    );
                                                })()
                                            )
                                        }
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