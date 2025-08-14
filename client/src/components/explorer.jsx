import { useState, useEffect } from "react";
import Select from "react-select";
import { fetchAllPlayers, fetchCustomStats, fetchPlayerSeasonStats, PLAYER_ICON_URL } from "../api/playerobjects";
import "./css/explorer.css";
import {
    ResponsiveContainer,
    ScatterChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Scatter
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

const AVAILABLE_STATS = [
    "GP", "GS", "MP", "FG", "FGA", "FGP", "THREEP", "THREEPA", "THREEPAP",
    "TWOP", "TWOPA", "TWOPAP", "EFGP", "FT", "FTA", "FTP", "ORB", "DRB",
    "TRB", "AST", "STL", "BLK", "TOV", "PF", "PTS"
];

const X_AXIS_OPTIONS = [
    { label: "Games Played", value: "games_played" },
    { label: "Position", value: "position" },
    { label: "Team", value: "team" }
];

const STAT_GROUPS = [
    { label: "Per Game", value: "per_game" },
    { label: "Advanced", value: "advanced" },
    { label: "Totals", value: "totals" },
    { label: "Per 100 Poss", value: "per100poss" },
    { label: "Shooting", value: "shooting" }
];

const CURRENT_SEASON = 2025;
const MAX_STAT_SELECTIONS = 5;
const CHART_HEIGHT = 400;
const PLAYER_ICON_SIZE = 40;

function ExplorerPage() {
   
    const [view, setView] = useState("explorer");
    
    const [selectedStats, setSelectedStats] = useState([{ id: Date.now(), stat: null }]);
    const [xAxisOption, setXAxisOption] = useState(X_AXIS_OPTIONS[0]);
    const [analyzing, setAnalyzing] = useState(false);
    const [customStatsResult, setCustomStatsResult] = useState([]);
    
    const [selectedStatGroup, setSelectedStatGroup] = useState(STAT_GROUPS[0]);
    const [playerOptions, setPlayerOptions] = useState([]);
    const [playersLoading, setPlayersLoading] = useState(true);
    const [playerOne, setPlayerOne] = useState(null);
    const [playerTwo, setPlayerTwo] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loadingComparison, setLoadingComparison] = useState(false);

    useEffect(() => {
        const loadPlayers = async () => {
            try {
                const playersData = await fetchAllPlayers();
                const formattedPlayers = playersData.map(player => ({
                    value: player.bbrID,
                    label: player.name,
                    headshot: player.headshot_icon
                }));
                setPlayerOptions(formattedPlayers);
            } catch (error) {
                console.error("Error loading players:", error);
            } finally {
                setPlayersLoading(false);
            }
        };
        
        loadPlayers();
    }, []);

    const handlePlayerOneChange = (selectedOption) => {
        setPlayerOne(selectedOption);
        setPlayerTwo(null); 
    };

    const handleCompare = async () => {
        if (!playerOne || !playerTwo) return;

        setLoadingComparison(true);
        setComparisonResult(null);

        try {
            const [playerOneStats, playerTwoStats] = await Promise.all([
                fetchPlayerSeasonStats(playerOne.value, CURRENT_SEASON),
                fetchPlayerSeasonStats(playerTwo.value, CURRENT_SEASON)
            ]);

            if (!playerOneStats || !playerTwoStats) {
                alert(`Could not find ${CURRENT_SEASON} stats for one or both players.`);
                return;
            }

            setComparisonResult({
                playerOne: {
                    name: playerOne.label,
                    stats: playerOneStats,
                    headshot: playerOne.headshot
                },
                playerTwo: {
                    name: playerTwo.label,
                    stats: playerTwoStats,
                    headshot: playerTwo.headshot
                }
            });
        } catch (error) {
            console.error("Comparison error:", error);
            alert("An error occurred while comparing players.");
        } finally {
            setLoadingComparison(false);
        }
    };

    const handleStatChange = (id, newValue) => {
        setSelectedStats(prev =>
            prev.map(stat => (stat.id === id ? { ...stat, stat: newValue } : stat))
        );
    };

    const addDropdown = () => {
        if (selectedStats.length < MAX_STAT_SELECTIONS) {
            setSelectedStats(prev => [...prev, { id: Date.now(), stat: null }]);
        }
    };

    const removeDropdown = (id) => {
        setSelectedStats(prev => prev.filter(stat => stat.id !== id));
    };

    const handleAnalyze = async () => {
        const validStats = selectedStats.filter(stat => stat.stat);
        if (validStats.length === 0) return;

        setAnalyzing(true);
        setCustomStatsResult([]);

        try {
            const statsPayload = validStats.map(stat => ({ key: stat.stat.value }));
            const result = await fetchCustomStats(CURRENT_SEASON, statsPayload, xAxisOption.value);
            setCustomStatsResult(result);
        } catch (error) {
            console.error("Error analyzing custom stats:", error);
            alert("Failed to fetch custom stats.");
        } finally {
            setAnalyzing(false);
        }
    };

    const createIndividualStats = (player, validSelectedStats) => {
        const individualStats = {};
        validSelectedStats.forEach(statItem => {
            const statKey = statItem.stat.value.toLowerCase();
            const originalKey = statItem.stat.value;
            const statValue = player.per_game?.[statKey];
            individualStats[originalKey] = statValue !== undefined && statValue !== null ? statValue : 'N/A';
        });
        return individualStats;
    };

    const generateChartData = () => {
        const isCategorical = ["position", "team"].includes(xAxisOption.value);
        const validSelectedStats = selectedStats.filter(stat => stat.stat);

        if (!isCategorical) {
            return {
                chartData: customStatsResult.map(player => ({
                    x: player.xAxis,
                    xLabel: player.xAxis,
                    y: parseFloat((player.total ?? 0).toFixed(1)),
                    name: player.name,
                    headshot: player.headshot,
                    id: player.player_bbrID,
                    individualStats: createIndividualStats(player, validSelectedStats)
                })),
                isCategorical: false
            };
        }

        const categoryLabels = [...new Set(
            customStatsResult.map(player =>
                Array.isArray(player.xAxis) ? player.xAxis.join(", ") : player.xAxis
            )
        )];

        const categoryMap = categoryLabels.reduce((acc, label, index) => {
            acc[label] = index + 1;
            return acc;
        }, {});

        return {
            chartData: customStatsResult.map(player => {
                const xLabel = Array.isArray(player.xAxis)
                    ? player.xAxis.join(", ")
                    : player.xAxis;

                return {
                    x: categoryMap[xLabel],
                    xLabel,
                    y: parseFloat((player.total ?? 0).toFixed(1)),
                    name: player.name,
                    headshot: player.headshot,
                    id: player.player_bbrID,
                    individualStats: createIndividualStats(player, validSelectedStats)
                };
            }),
            categoryMap,
            isCategorical: true
        };
    };

    const formatStatName = (statKey) => {
        return statKey.toLowerCase() === "ts_pct" ? "TS%" : statKey.toUpperCase();
    };

    const determineWinner = (p1Val, p2Val) => {
        if (isNaN(p1Val) || isNaN(p2Val)) return 'tie';
        return p1Val > p2Val ? 'p1' : p1Val < p2Val ? 'p2' : 'tie';
    };

    const shouldFilterStat = (statKey, group) => {
        const lower = statKey.toLowerCase();
        if (group === "per_game" && (lower === "gs" || lower === "awards")) return true;
        if (group === "advanced" && lower === "mpt") return true;
        return false;
    };

    const statOptions = AVAILABLE_STATS.map(stat => ({
        label: stat,
        value: stat,
        isDisabled: selectedStats.some(s => s.stat?.value === stat)
    }));

    const validSelectedStats = selectedStats.filter(stat => stat.stat);
    const statsLabel = validSelectedStats.map(stat => stat.stat.label).join(' + ');

    const { chartData, categoryMap, isCategorical } = customStatsResult.length > 0
        ? generateChartData()
        : { chartData: [], categoryMap: {}, isCategorical: false };

    const sortedTableData = chartData.length > 0 
        ? [...chartData].sort((a, b) => b.y - a.y)
        : [];

    const isAnalyzeDisabled = analyzing || validSelectedStats.length === 0;
    const isCompareDisabled = loadingComparison || !playerOne || !playerTwo;

    const renderTooltipContent = ({ active, payload }) => {
        if (!active || !payload?.length) return null;

        const player = payload[0].payload;
        return (
            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#2d3748" }}>
                    {player.name}
                </div>
                <div style={{ marginBottom: "4px", color: "#4a5568" }}>
                    <strong>{xAxisOption.label}:</strong> {player.xLabel}
                </div>
                {validSelectedStats.length > 1 ? (
                    <>
                        {validSelectedStats.map((statItem, index) => (
                            <div key={index} style={{ marginBottom: "2px", color: "#4a5568", fontSize: "0.9rem" }}>
                                <strong>{statItem.stat.label}:</strong> {player.individualStats?.[statItem.stat.value] || 'N/A'}
                            </div>
                        ))}
                        <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #e2e8f0", fontWeight: "bold", color: "#2d3748" }}>
                            <strong>Total:</strong> {player.y}
                        </div>
                    </>
                ) : (
                    <div style={{ color: "#2d3748" }}>
                        <strong>Total:</strong> {player.y}
                    </div>
                )}
            </div>
        );
    };

    const renderPlayerIcon = ({ cx, cy, payload }) => {
        const radius = PLAYER_ICON_SIZE / 2;
        return (
            <g>
                <clipPath id={`clip-${payload.id}`}>
                    <circle cx={cx} cy={cy} r={radius} />
                </clipPath>
                <image
                    href={`${PLAYER_ICON_URL}${payload.headshot}`}
                    x={cx - radius}
                    y={cy - radius}
                    width={PLAYER_ICON_SIZE}
                    height={PLAYER_ICON_SIZE}
                    clipPath={`url(#clip-${payload.id})`}
                    preserveAspectRatio="xMidYMid slice"
                />
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={2}
                />
            </g>
        );
    };

    return (
        <div className="stats-explorer-container">
            <header className="stats-header">
                <h1>{view === "explorer" ? "Explorer" : "Player Comparison"}</h1>
                <div className="header-actions">
                    <button
                        onClick={() => setView(view === "explorer" ? "comparison" : "explorer")}
                        className="view-switcher-btn"
                    >
                        {view === "explorer" ? "Compare Players" : "Back to Explorer"}
                    </button>
                    <div className="season-selector">
                        <span>Season: {CURRENT_SEASON}</span>
                    </div>
                </div>
            </header>

            <main className="stats-main-content">
                {view === "explorer" ? (
                    <>
                        <aside className="filters-sidebar">
                            {selectedStats.map((stat, index) => (
                                <div key={stat.id} className="filter-row">
                                    <label>{`Statistic #${index + 1}`}</label>
                                    <div className="select-with-remove">
                                        <Select
                                            value={stat.stat}
                                            options={statOptions.filter(
                                                opt => !opt.isDisabled || opt.value === stat.stat?.value
                                            )}
                                            onChange={val => handleStatChange(stat.id, val)}
                                            placeholder="Select Stat"
                                            isClearable
                                            className="stat-select"
                                        />
                                        {selectedStats.length > 1 && (
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => removeDropdown(stat.id)}
                                                aria-label="Remove stat"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="action-buttons">
                                {selectedStats.length < MAX_STAT_SELECTIONS && (
                                    <button onClick={addDropdown}>Add Filter</button>
                                )}
                            </div>

                            <div className="filter-row">
                                <label>X-Axis</label>
                                <Select
                                    value={xAxisOption}
                                    onChange={setXAxisOption}
                                    options={X_AXIS_OPTIONS}
                                    className="stat-select"
                                />
                            </div>

                            <div className="analyze-button-container">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzeDisabled}
                                >
                                    {analyzing ? "Analyzing..." : "Analyze"}
                                </button>
                            </div>
                        </aside>

                        <section className="content-panel">
                            {chartData.length > 0 ? (
                                <>
                                    <Card sx={{ margin: "1rem 0", padding: "1rem" }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {`Scatter Plot: Total (${statsLabel}) vs ${xAxisOption.label}`}
                                            </Typography>
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
                                                    <CartesianGrid />
                                                    <XAxis
                                                        dataKey="x"
                                                        type="number"
                                                        domain={isCategorical ? undefined : ([min, max]) => [
                                                            Math.floor(min / 5) * 5 - 5,
                                                            Math.ceil(max / 5) * 5 + 5
                                                        ]}
                                                        ticks={isCategorical ? Object.values(categoryMap) : undefined}
                                                        tickFormatter={isCategorical
                                                            ? (x) => Object.entries(categoryMap).find(([label, val]) => val === x)?.[0] ?? x
                                                            : undefined}
                                                        allowDecimals={false}
                                                        interval={0}
                                                        tick={{ fontSize: 12 }}
                                                        angle={isCategorical ? -45 : 0}
                                                        textAnchor={isCategorical ? "end" : "middle"}
                                                        label={{
                                                            value: xAxisOption.label,
                                                            position: "bottom",
                                                            offset: 10
                                                        }}
                                                    />
                                                    <YAxis
                                                        dataKey="y"
                                                        name="Total"
                                                        label={{
                                                            value: `Total (${statsLabel})`,
                                                            angle: -90,
                                                            position: "insideLeft"
                                                        }}
                                                        domain={([min, max]) => [
                                                            Math.floor(min / 5) * 5 - 5,
                                                            Math.ceil(max / 5) * 5 + 5
                                                        ]}
                                                        allowDecimals={false}
                                                    />
                                                    <Tooltip
                                                        cursor={{ strokeDasharray: '3 3' }}
                                                        content={renderTooltipContent}
                                                    />
                                                    <Scatter
                                                        name="Players"
                                                        data={chartData}
                                                        shape={renderPlayerIcon}
                                                    />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    <Card sx={{ margin: "1rem 0", padding: "1rem" }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Player Statistics Table
                                            </Typography>
                                            <div className="player-data-table-wrapper">
                                                <table className="player-data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Rank</th>
                                                            <th>Player</th>
                                                            <th>{xAxisOption.label}</th>
                                                            {validSelectedStats.map((statItem, index) => (
                                                                <th key={index}>{statItem.stat.label}</th>
                                                            ))}
                                                            <th>Total ({statsLabel})</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedTableData.map((player, index) => (
                                                            <tr key={player.id}>
                                                                <td className="rank-cell">#{index + 1}</td>
                                                                <td className="player-cell">
                                                                    <div className="player-info">
                                                                        <img 
                                                                            src={`${PLAYER_ICON_URL}${player.headshot}`}
                                                                            alt={player.name}
                                                                            className="player-table-image"
                                                                            onError={(e) => { e.target.style.visibility = 'hidden'; }}
                                                                        />
                                                                        <span className="player-name">{player.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td>{player.xLabel}</td>
                                                                {validSelectedStats.map((statItem, statIndex) => (
                                                                    <td key={statIndex}>
                                                                        {player.individualStats?.[statItem.stat.value] || 'N/A'}
                                                                    </td>
                                                                ))}
                                                                <td className="total-cell">{player.y}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <div className="explore-prompt">
                                    <h2>Explore Stats By Adding Filters</h2>
                                    <p>You can compare players by adding and customizing filters on the left.</p>
                                </div>
                            )}
                        </section>
                    </>
                ) : (

                    <div className="comparison-view">
                        {comparisonResult && !loadingComparison && (
                            <div className="advanced-comparison-wrapper">
                                <div className="player-block">
                                    <img
                                        className="player-image"
                                        src={`${PLAYER_ICON_URL}${comparisonResult.playerOne.headshot}`}
                                        alt={`${comparisonResult.playerOne.name} headshot`}
                                        onError={(e) => { e.target.style.visibility = 'hidden'; }}
                                    />
                                    <h3>{comparisonResult.playerOne.name}</h3>
                                </div>

                                <div className="comparison-table">
                                    <h2>{selectedStatGroup.label}</h2>
                                    <div className="comparison-table-scroll-wrapper">
                                        <table>
                                            <tbody>
                                                {Object.entries(comparisonResult.playerOne.stats[selectedStatGroup.value] || {})
                                                    .filter(([statKey]) => !shouldFilterStat(statKey, selectedStatGroup.value))
                                                    .map(([statKey, p1Val]) => {
                                                        const p2Val = comparisonResult.playerTwo.stats[selectedStatGroup.value]?.[statKey] ?? 'N/A';
                                                        const winner = determineWinner(p1Val, p2Val);

                                                        return (
                                                            <tr key={statKey}>
                                                                <td className={`stat-cell ${winner === 'p1' ? 'highlight' : ''}`}>
                                                                    {typeof p1Val === 'number' ? p1Val.toFixed(1) : p1Val}
                                                                </td>
                                                                <td className="stat-name">
                                                                    {formatStatName(statKey)}
                                                                </td>
                                                                <td className={`stat-cell ${winner === 'p2' ? 'highlight' : ''}`}>
                                                                    {typeof p2Val === 'number' ? p2Val.toFixed(1) : p2Val}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="player-block">
                                    <img
                                        className="player-image"
                                        src={`${PLAYER_ICON_URL}${comparisonResult.playerTwo.headshot}`}
                                        alt={`${comparisonResult.playerTwo.name} headshot`}
                                        onError={(e) => { e.target.style.visibility = 'hidden'; }}
                                    />
                                    <h3>{comparisonResult.playerTwo.name}</h3>
                                </div>
                            </div>
                        )}

                        <div className="comparison-filters">
                            <h2>Select Players</h2>
                            <div className="player-selectors">
                                <Select
                                    options={playerOptions}
                                    value={playerOne}
                                    onChange={handlePlayerOneChange}
                                    placeholder={playersLoading ? "Loading players..." : "Select Player 1"}
                                    isClearable
                                    isSearchable
                                    isLoading={playersLoading}
                                />
                                <span className="vs-text">VS</span>
                                <Select
                                    options={playerOptions.filter(player => player.value !== playerOne?.value)}
                                    value={playerTwo}
                                    onChange={setPlayerTwo}
                                    placeholder={playersLoading ? "Loading players..." : "Select Player 2"}
                                    isDisabled={!playerOne || playersLoading}
                                    isClearable
                                    isSearchable
                                    isLoading={playersLoading}
                                />
                            </div>

                            <div className="stat-selector-multi">
                                <label>Stat Category</label>
                                <Select
                                    options={STAT_GROUPS}
                                    value={selectedStatGroup}
                                    onChange={setSelectedStatGroup}
                                    placeholder="Select stat group"
                                    menuPortalTarget={document.body}
                                    menuPosition="absolute"
                                    menuPlacement="auto"
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                    }}
                                />
                            </div>

                            <div className="analyze-button-container">
                                <button onClick={handleCompare} disabled={isCompareDisabled}>
                                    {loadingComparison ? "Comparing..." : "Compare"}
                                </button>
                            </div>
                        </div>

                        {loadingComparison && <div className="loading-message">Comparing...</div>}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ExplorerPage;