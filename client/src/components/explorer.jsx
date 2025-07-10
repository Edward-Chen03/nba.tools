import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchCustomStats } from "../api/customstats";
import { fetchAllPlayers, fetchPlayerSeasonStats } from "../api/playerobjects";
import "./css/explorer.css";

const availableStats = [
    "PTS", "TRB", "AST", "STL"
];

const directionOptions = [
    { label: "Descending (High is Better)", value: "desc" },
    { label: "Ascending (Low is Better)", value: "asc" }
];

function ExplorerPage() {
    const [view, setView] = useState('explorer');
    const [selectedStats, setSelectedStats] = useState([
        { id: Date.now(), stat: null, direction: directionOptions[0] }
    ]);
    const [analyzedStats, setAnalyzedStats] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [season] = useState(2025);
    const [playerOptions, setPlayerOptions] = useState([]);
    const [playersLoading, setPlayersLoading] = useState(true);
    const [playerOne, setPlayerOne] = useState(null);
    const [playerTwo, setPlayerTwo] = useState(null);
    const [comparisonStats, setComparisonStats] = useState([]);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loadingComparison, setLoadingComparison] = useState(false);

    useEffect(() => {
        const loadPlayers = async () => {
            setPlayersLoading(true);
            const playersData = await fetchAllPlayers();
            
            const formattedPlayers = playersData.map(player => ({

                value: player.bbrID, 
                label: player.name
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
        if (!playerOne || !playerTwo || comparisonStats.length === 0) {
            alert("Please select two players and at least one stat to compare.");
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
                alert(`Could not find ${season} stats for one or both players.`);
                setLoadingComparison(false);
                return;
            }

            setComparisonResult({
                playerOne: {
                    name: playerOne.label,
                    stats: playerOneStats
                },
                playerTwo: {
                    name: playerTwo.label,
                    stats: playerTwoStats
                }
            });

        } catch (error) {
            alert("An error occurred while comparing players. Please try again.");
        } finally {
            setLoadingComparison(false);
        }
    };

    const activeSelectedStats = selectedStats.filter(s => s.stat);

    const handleStatChange = (id, newValue) => {
        setSelectedStats(prev => prev.map(s => s.id === id ? { ...s, stat: newValue } : s));
    };

    const handleDirectionChange = (id, newValue) => {
        setSelectedStats(prev => prev.map(s => s.id === id ? { ...s, direction: newValue } : s));
    };

    const addDropdown = () => {
        if (selectedStats.length < 5) {
            setSelectedStats(prev => [...prev, { id: Date.now(), stat: null, direction: directionOptions[0] }]);
        }
    };

    const removeDropdown = (id) => {
        setSelectedStats(prev => prev.filter(s => s.id !== id));
    };

    const selectedValues = activeSelectedStats.map(s => s.stat?.value);

    const statOptions = availableStats.map(stat => ({
        label: stat,
        value: stat,
        isDisabled: selectedValues.includes(stat)
    }));
    
    const comparisonStatOptions = availableStats.map(stat => ({
        label: stat,
        value: stat
    }));

    const analyzeStats = async () => {
        const statsPayload = activeSelectedStats.map(s => ({
            key: s.stat.value.toLowerCase().replace('%', 'pct'),
            direction: s.direction.value
        }));

        if (statsPayload.length === 0) return alert("Please select at least one stat to analyze.");

        try {
            setLoading(true);
            const data = await fetchCustomStats(statsPayload, season, 1, 20);
            setResults(data);
            setAnalyzedStats(activeSelectedStats);
        } catch (error) {
            alert("Failed to fetch custom stats. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stats-explorer-container">
            <header className="stats-header">
                <h1>{view === 'explorer' ? 'Explorer' : 'Player Comparison'}</h1>
                <div className="header-actions">
                    <button onClick={() => setView(v => v === 'explorer' ? 'comparison' : 'explorer')} className="view-switcher-btn">
                        {view === 'explorer' ? 'Compare Players' : 'Back to Explorer'}
                    </button>
                    <div className="season-selector">
                        <span>Season: {season}</span>
                    </div>
                </div>
            </header>

            <main className="stats-main-content">
                 {view === 'explorer' ? (
                    <>
                        <aside className="filters-sidebar">
                            {selectedStats.map((s, index) => (
                                <div key={s.id} className="filter-row">
                                    <label>{`Filter #${index + 1}`}</label>
                                    <div className="select-with-remove">
                                        <Select
                                            value={s.stat}
                                            options={statOptions.filter(opt => !opt.isDisabled || opt.value === s.stat?.value)}
                                            onChange={val => handleStatChange(s.id, val)}
                                            placeholder="Select Stat"
                                            isClearable
                                            className="stat-select"
                                        />
                                        {selectedStats.length > 1 && (
                                            <button className="remove-btn" onClick={() => removeDropdown(s.id)}>×</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="action-buttons">
                                {selectedStats.length < 5 && (
                                    <button onClick={addDropdown} disabled={loading}>Add Filter</button>
                                )}
                            </div>
                        </aside>
                        <div className="content-panel">
                            {results.length === 0 && !loading && (
                                <div className="explore-prompt">
                                    <h2>Explore Stats By Adding Filters</h2>
                                    <p>You can compare players by adding and customizing filters on the left.</p>
                                </div>
                            )}
                            {loading && <div className="loading-message">Analyzing...</div>}
                            {results.length > 0 && !loading && (
                                <div className="stats-table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="player-header">Player</th>
                                                {analyzedStats.map(s => (
                                                    <th key={s.id} className="stat-header">{s.stat.label}</th>
                                                ))}
                                                <th className="stat-header">Total Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map(item => (
                                                <tr key={item.player_bbrID}>
                                                    <td className="player-name">{item.playerObject?.name}</td>
                                                    {analyzedStats.map(s => (
                                                        <td key={s.id} className="stat-value">
                                                            {item.per_game?.[s.stat.value.toLowerCase().replace('%', 'pct')] ?? 'N/A'}
                                                        </td>
                                                    ))}
                                                    <td className="stat-value total-score">
                                                        {Math.abs(item.totalContribution).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeSelectedStats.length > 0 && (
                                <div className="analyze-button-container">
                                    <button onClick={analyzeStats} disabled={loading || activeSelectedStats.length === 0}>
                                        {loading ? "Analyzing..." : "Analyze"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="comparison-view">
                         <div className="comparison-filters">
                            <h2>Select Players and Stats</h2>
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
                                <label>Stats to Compare</label>
                                 <Select
                                    isMulti
                                    options={comparisonStatOptions}
                                    value={comparisonStats}
                                    onChange={setComparisonStats}
                                    placeholder="Select stats..."
                                />
                            </div>
                             <div className="analyze-button-container">
                                <button onClick={handleCompare} disabled={loadingComparison || !playerOne || !playerTwo || comparisonStats.length === 0}>
                                    {loadingComparison ? "Comparing..." : "Compare"}
                                </button>
                            </div>
                        </div>

                        {loadingComparison && <div className="loading-message">Comparing...</div>}

                        {comparisonResult && !loadingComparison && (
                             <div className="comparison-results-table stats-table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="stat-header" style={{textAlign: 'left'}}>Stat</th>
                                            <th className="player-header">{comparisonResult.playerOne.name}</th>
                                            <th className="player-header">{comparisonResult.playerTwo.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonStats.map(stat => {
                                            const statKey = stat.value.toLowerCase(); 
                                            return (
                                                <tr key={stat.value}>
                                                    <td className="stat-value" style={{textAlign: 'left', fontWeight: 'bold'}}>{stat.label}</td>
                                                    <td className="stat-value">{comparisonResult.playerOne.stats[statKey] ?? 'N/A'}</td>
                                                    <td className="stat-value">{comparisonResult.playerTwo.stats[statKey] ?? 'N/A'}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ExplorerPage;