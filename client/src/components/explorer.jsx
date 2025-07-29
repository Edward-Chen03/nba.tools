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
    Scatter,
    Legend
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

const availableStats = ["PTS", "TRB", "AST", "STL"];

const statGroups = [
    { label: "Per Game", value: "per_game" },
    { label: "Advanced", value: "advanced" },
    { label: "Totals", value: "totals" },
    { label: "Per 100 Poss", value: "per100poss" },
    { label: "Shooting", value: "shooting" }
];

const xAxisOptions = [
    { label: "Games Played", value: "games_played" },
    { label: "Position", value: "position" },
    { label: "Team", value: "team" }
];

function ExplorerPage() {

    const [view, setView] = useState("explorer");
    const [loadingComparison, setLoadingComparison] = useState(false);

    const [selectedStats, setSelectedStats] = useState([{ id: Date.now(), stat: null }]);
    const [xAxisOption, setXAxisOption] = useState(xAxisOptions[0]);
    const [season] = useState(2025);

    const [selectedStatGroup, setSelectedStatGroup] = useState(statGroups[0]);
    const [customStatsResult, setCustomStatsResult] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);

    const [playerOptions, setPlayerOptions] = useState([]);
    const [playersLoading, setPlayersLoading] = useState(true);
    const [playerOne, setPlayerOne] = useState(null);
    const [playerTwo, setPlayerTwo] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);

    const categorySet = new Set(
        customStatsResult.map(player =>
            Array.isArray(player.xAxis) ? player.xAxis.join(", ") : player.xAxis
        )
    );
    const categoryMap = Array.from(categorySet).reduce((acc, label, index) => {
        acc[label] = index + 1;
        return acc;
    }, {});
    const allXValues = Object.values(categoryMap);
    const chartData = customStatsResult.map(player => {
        const xLabel = Array.isArray(player.xAxis)
            ? player.xAxis.join(", ")
            : player.xAxis;

        return {
            x: categoryMap[xLabel],
            xLabel,
            y: player.total ?? 0,
            name: player.name,
            headshot: player.headshot,
            id: player.player_bbrID
        };
    });

    useEffect(() => {
        const loadPlayers = async () => {
            setPlayersLoading(true);
            const playersData = await fetchAllPlayers();
            const formattedPlayers = playersData.map(player => ({
                value: player.bbrID,
                label: player.name,
                headshot: player.headshot_icon
            }));
            setPlayerOptions(formattedPlayers);
            setPlayersLoading(false);
        };
        loadPlayers();
    }, []);

    const handlePlayerOneChange = (selectedOption) => {
        setPlayerOne(selectedOption);
        setPlayerTwo(null);
    };

    const handleCompare = async () => {
        if (!playerOne || !playerTwo) {
            alert("Please select two players to compare.");
            return;
        }

        setLoadingComparison(true);
        setComparisonResult(null);

        try {
            const [playerOneStats, playerTwoStats] = await Promise.all([
                fetchPlayerSeasonStats(playerOne.value, season),
                fetchPlayerSeasonStats(playerTwo.value, season)
            ]);

            if (!playerOneStats || !playerTwoStats) {
                alert("Could not find ${ season } stats for one or both players.");
                setLoadingComparison(false);
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
            alert("An error occurred while comparing players. Please try again.");
        } finally {
            setLoadingComparison(false);
        }
    };

    const handleStatChange = (id, newValue) => {
        setSelectedStats(prev =>
            prev.map(s => (s.id === id ? { ...s, stat: newValue } : s))
        );
    };

    const addDropdown = () => {
        if (selectedStats.length < 5) {
            setSelectedStats(prev => [...prev, { id: Date.now(), stat: null }]);
        }
    };

    const removeDropdown = id => {
        setSelectedStats(prev => prev.filter(s => s.id !== id));
    };

    const statOptions = availableStats.map(stat => ({
        label: stat,
        value: stat,
        isDisabled: selectedStats.some(s => s.stat?.value === stat)
    }));

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setCustomStatsResult([]);
        try {
            const statsPayload = selectedStats
                .filter(s => s.stat)
                .map(s => ({ key: s.stat.value }));

            const result = await fetchCustomStats(season, statsPayload, xAxisOption.value);
            setCustomStatsResult(result);
        } catch (err) {
            console.error("Error analyzing custom stats:", err);
            alert("Failed to fetch custom stats.");
        } finally {
            setAnalyzing(false);
        }
    };



    console.log(customStatsResult)

    return (
        <div className="stats-explorer-container">
            <header className="stats-header">
                <h1>{view === "explorer" ? "Explorer" : "Player Comparison"}</h1>
                <div className="header-actions">
                    <button
                        onClick={() => setView(v => (v === "explorer" ? "comparison" : "explorer"))}
                        className="view-switcher-btn"
                    >
                        {view === "explorer" ? "Compare Players" : "Back to Explorer"}
                    </button>
                    <div className="season-selector">
                        <span>Season: {season}</span>
                    </div>
                </div>
            </header>

            <main className="stats-main-content">
                {view === "explorer" ? (
                    <>
                        <aside className="filters-sidebar">
                            {selectedStats.map((s, index) => (
                                <div key={s.id} className="filter-row">
                                    <label>{`Statistic #${index + 1}`}</label>
                                    <div className="select-with-remove">
                                        <Select
                                            value={s.stat}
                                            options={statOptions.filter(
                                                opt => !opt.isDisabled || opt.value === s.stat?.value
                                            )}
                                            onChange={val => handleStatChange(s.id, val)}
                                            placeholder="Select Stat"
                                            isClearable
                                            className="stat-select"
                                        />
                                        {selectedStats.length > 1 && (
                                            <button className="remove-btn" onClick={() => removeDropdown(s.id)}>
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="action-buttons">
                                {selectedStats.length < 5 && (
                                    <button onClick={addDropdown}>Add Filter</button>
                                )}
                            </div>

                            <div className="filter-row">
                                <label>X-Axis</label>
                                <Select
                                    value={xAxisOption}
                                    onChange={setXAxisOption}
                                    options={xAxisOptions}
                                    placeholder="Select X-Axis"
                                    className="stat-select"
                                />
                            </div>

                            <div className="analyze-button-container">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || selectedStats.every(s => !s.stat)}
                                >
                                    {analyzing ? "Analyzing..." : "Analyze"}
                                </button>
                            </div>
                        </aside>

                        <div className="content-panel">
                            {customStatsResult.length > 0 && selectedStats[0]?.stat?.value ? (
                                <Card sx={{ margin: "1rem 0", padding: "1rem" }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {`Scatter Plot: Total (${selectedStats.map(s => s.stat?.label || '').join(' + ')}) vs ${xAxisOption.label}`
                                            }
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <ScatterChart>
                                                <CartesianGrid />
                                                <XAxis
                                                    dataKey="x"
                                                    type="number"
                                                    domain={['dataMin', 'dataMax']}
                                                    ticks={allXValues} 
                                                    tickFormatter={(x) =>
                                                        Object.entries(categoryMap).find(([label, val]) => val === x)?.[0] ?? x
                                                    }
                                                    allowDecimals={false}
                                                    interval={0}
                                                    tick={{ fontSize: 12 }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                />


                                                <YAxis
                                                    dataKey="y"
                                                    name={`Total (${selectedStats.map(s => s.stat?.label).join(' + ')})`}
                                                    label={{
                                                        value: `Total (${selectedStats.map(s => s.stat?.label).join(' + ')})`,
                                                        angle: -90,
                                                        position: "insideLeft"
                                                    }}
                                                    domain={['dataMin - 2', 'dataMax + 2']}
                                                />
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload?.length > 0) {
                                                            const p = payload[0].payload;
                                                            return (
                                                                <div style={{ background: "#fff", border: "1px solid #ccc", padding: "8px" }}>
                                                                    <div><strong>Player:</strong> {p.name}</div>
                                                                    <div><strong>{xAxisOption.label}:</strong> {p.x}</div>
                                                                    <div><strong>Total ({selectedStats.map(s => s.stat?.label).join(' + ')}):</strong> {p.y}</div>

                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Scatter
                                                    name="Players"
                                                    data={chartData}
                                                    shape={({ cx, cy, payload }) => {
                                                        const size = 40;
                                                        const radius = size / 2;

                                                        return (
                                                            <g>
                                                                <clipPath id={`clip-${payload.id}`}>
                                                                    <circle cx={cx} cy={cy} r={radius} />
                                                                </clipPath>
                                                                <image
                                                                    href={`${PLAYER_ICON_URL}${payload.headshot}`}
                                                                    x={cx - radius}
                                                                    y={cy - radius}
                                                                    width={size}
                                                                    height={size}
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
                                                    }}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="explore-prompt">
                                    <h2>Explore Stats By Adding Filters</h2>
                                    <p>You can compare players by adding and customizing filters on the left.</p>
                                </div>
                            )}


                        </div>
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
                                                    .filter(([statKey]) => {
                                                        const lower = statKey.toLowerCase();
                                                        const group = selectedStatGroup.value;
                                                        if (group === "per_game" && (lower === "gs" || lower === "awards")) return false;
                                                        if (group === "advanced" && lower === "mpt") return false;
                                                        return true;
                                                    })
                                                    .map(([statKey, p1Val]) => {
                                                        const p2Val = comparisonResult.playerTwo.stats[selectedStatGroup.value]?.[statKey] ?? 'N/A';
                                                        const winner = !isNaN(p1Val) && !isNaN(p2Val)
                                                            ? p1Val > p2Val ? 'p1' : p1Val < p2Val ? 'p2' : 'tie'
                                                            : 'tie';

                                                        return (
                                                            <tr key={statKey}>
                                                                <td className={`stat-cell ${winner === 'p1' ? 'highlight' : ''}`}>
                                                                    {typeof p1Val === 'number' ? p1Val.toFixed(1) : p1Val}
                                                                </td>
                                                                <td className="stat-name">
                                                                    {statKey.toLowerCase() === "ts_pct" ? "TS%" : statKey.toUpperCase()}
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

                        {loadingComparison && <div className="loading-message">Comparing...</div>}

                        <div className="comparison-filters">
                            <h2>Select Players</h2>
                            <div className="player-selectors">
                                <Select
                                    options={playerOptions}
                                    value={playerOne}
                                    onChange={handlePlayerOneChange}
                                    placeholder={playersLoading ? "Loading players..." : "Select Player 1"}
                                    isClearable
                                    isLoading={playersLoading}
                                />
                                <span className="vs-text">VS</span>
                                <Select
                                    options={playerOptions.filter(p => p.value !== playerOne?.value)}
                                    value={playerTwo}
                                    onChange={setPlayerTwo}
                                    placeholder={playersLoading ? "Loading players..." : "Select Player 2"}
                                    isDisabled={!playerOne || playersLoading}
                                    isClearable
                                    isLoading={playersLoading}
                                />
                            </div>

                            <div className="stat-selector-multi">
                                <label>Stat Category</label>
                                <Select
                                    options={statGroups}
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
                                <button onClick={handleCompare} disabled={loadingComparison || !playerOne || !playerTwo}>
                                    {loadingComparison ? "Comparing..." : "Compare"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ExplorerPage;
