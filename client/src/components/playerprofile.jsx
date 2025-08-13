import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlayerSeasons } from "../api/seasonstats";
import { fetchPlayer } from "../api/playerobjects";
import StatsTable from "./def/playertables";
import "./css/playerprofile.css";
import { Box, Paper, Typography, Divider, Button, CircularProgress, Chip } from "@mui/material";

function ProfilePage() {
    const { bbrID } = useParams();
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [playerInfo, setPlayerInfo] = useState(null); 
    const [expandedSeasons, setExpandedSeasons] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); 
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
            }
        };

        fetchData();
    }, [bbrID]);

    if (loading || !playerInfo) {
        return (
            <div className="player-details-page">
                <Box className="loading-container">
                    <CircularProgress sx={{ color: '#ffffff' }} />
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

            {/* Player Header Section */}
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

            {/* Seasons Section */}
            {seasons.length > 0 && (
                <Box className="seasons-section">
                    <Typography variant="h4" className="seasons-title">
                        Career Statistics
                    </Typography>
                    
                    <Box className="seasons-container">
                        {seasons.map((season, index) => (
                            <Paper key={season.season} className="season-card" elevation={3}>
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