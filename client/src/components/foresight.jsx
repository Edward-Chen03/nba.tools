import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchAllPlayers } from "../api/playerobjects";
import { predictPlayerOutcome } from "../api/foresight";
import "./css/foresight.css";

function ForesightPage() {
  const [selectedStat, setSelectedStat] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [threshold, setThreshold] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      const res = await fetchAllPlayers();
      const formatted = res.map(p => ({
        label: p.name,
        value: p.bbrID
      }));
      setPlayers(formatted);
    };
    loadPlayers();
  }, []);

  const handlePredictClick = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prediction = await predictPlayerOutcome({
        bbrID: selectedPlayer?.value,
        season: 2025,
        statThresholds: [
          {
            key: selectedStat.value,
            op: comparison.value,
            value: Number(threshold)
          }
        ]
      });

      setResult(prediction);
      console.log(prediction)
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statOptions = [
    { label: "PTS", value: "pts" },
    { label: "TRB", value: "trb" },
    { label: "AST", value: "ast" }
  ];

  const comparisonOptions = [
    { label: "Greater Than", value: ">" },
    { label: "Less Than", value: "<" },
    { label: "Greater Than or Equal", value: ">=" },
    { label: "Less Than or Equal", value: "<=" },
    { label: "Equals", value: "==" }
  ];

  const readableStatLabel = key => {
    const map = {
      pts: "PTS",
      trb: "TRB",
      ast: "AST"
    };
    return map[key] || key.toUpperCase();
  };

  return (
    <div className="foresight-container">
      <header className="stats-header">
        <h1>Foresight</h1>
        <div className="header-actions">
          <div className="season-selector">
            <span>Season: 2025</span>
          </div>
        </div>
      </header>

      <main className="foresight-main-content">
        <div className="content-panel">
          <div className="foresight-form" style={{ maxWidth: 500, margin: "0 auto" }}>
            <h2>Run a Prediction</h2>

            <div className="input-group">
              <label>Player</label>
              <Select
                options={players}
                value={selectedPlayer}
                onChange={setSelectedPlayer}
                placeholder="Select a player..."
                isClearable
              />
            </div>

            <div className="input-group">
              <label>Stat</label>
              <Select
                options={statOptions}
                value={selectedStat}
                onChange={setSelectedStat}
                placeholder="Select stat..."
              />
            </div>

            <div className="input-group">
              <label>Comparison</label>
              <Select
                options={comparisonOptions}
                value={comparison}
                onChange={setComparison}
                placeholder="Select comparison..."
              />
            </div>

            <div className="input-group">
              <label>Value</label>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder="e.g. 25"
              />
            </div>

            <div className="analyze-button-container">
              <button
                onClick={handlePredictClick}
                disabled={!selectedPlayer || threshold === "" || loading}
              >
                {loading ? "Predicting..." : "Predict"}
              </button>
            </div>

            {result && (
              <div className="prediction-result" style={{ marginTop: "2rem" }}>
                <h3>Prediction Result</h3>
                <p><strong>Target:</strong> {result.target_description}</p>
                <p><strong>Probability:</strong> {(result.probability * 100).toFixed(1)}%</p>

                <div style={{ marginTop: "1.5rem" }}>
                  <h4>Rolling Averages of the Last 10 Games</h4>
                  <ul style={{ paddingLeft: "1rem" }}>
                    {Object.entries(result.recent_rolling_averages || {})
                      .filter(([key]) => key.endsWith("_last10_avg"))
                      .map(([key, value]) => {
                        const statLabel = key.replace("_last10_avg", "").toUpperCase();
                        return (
                          <li key={key}>
                            <strong>{statLabel}:</strong> {typeof value === "number" ? value.toFixed(2) : value}
                          </li>
                        );
                      })}
                  </ul>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <h4>Last 5 Games</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>Date</th>
                        <th style={{ textAlign: "right" }}>PTS</th>
                        <th style={{ textAlign: "right" }}>TRB</th>
                        <th style={{ textAlign: "right" }}>AST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.last_5_games.map((game, idx) => (
                        <tr key={idx}>
                          <td>{game.date}</td>
                          <td style={{ textAlign: "right" }}>{game.pts}</td>
                          <td style={{ textAlign: "right" }}>{game.trb}</td>
                          <td style={{ textAlign: "right" }}>{game.ast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForesightPage;
