import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchAllPlayers } from "../api/playerobjects";
import { predictPlayerOutcome } from "../api/foresight";
import "./css/foresight.css";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from "@mui/material";

const STAT_OPTIONS = [
  { label: "PTS", value: "pts" },
  { label: "TRB", value: "trb" },
  { label: "AST", value: "ast" }
];

const COMPARISON_OPTIONS = [
  { label: "Greater Than", value: ">" },
  { label: "Less Than", value: "<" },
  { label: "Greater Than or Equal", value: ">=" },
  { label: "Less Than or Equal", value: "<=" },
  { label: "Equals", value: "==" }
];

const CURRENT_SEASON = 2025;

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
      try {
        const res = await fetchAllPlayers();
        const formatted = res.map(player => ({
          label: player.name,
          value: player.bbrID
        }));
        setPlayers(formatted);
      } catch (error) {
        console.error("Error loading players:", error);
      }
    };
    
    loadPlayers();
  }, []);

  const handlePredictClick = async () => {
    if (!selectedPlayer || !selectedStat || !comparison || threshold === "") {
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const prediction = await predictPlayerOutcome({
        bbrID: selectedPlayer.value,
        season: CURRENT_SEASON,
        statThresholds: [
          {
            key: selectedStat.value,
            op: comparison.value,
            value: Number(threshold)
          }
        ]
      });

      setResult(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatLabel = (key) => {
    return key.replace("_last10_avg", "").toUpperCase();
  };

  const isFormValid = selectedPlayer && selectedStat && comparison && threshold !== "";

  return (
    <div className="foresight-container">
      <header className="stats-header">
        <h1>Foresight</h1>
        <div className="header-actions">
          <div className="season-selector">
            <span>Season: {CURRENT_SEASON}</span>
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
                isSearchable
              />
            </div>

            <div className="input-group">
              <label>Stat</label>
              <Select
                options={STAT_OPTIONS}
                value={selectedStat}
                onChange={setSelectedStat}
                placeholder="Select stat..."
                isClearable
              />
            </div>

            <div className="input-group">
              <label>Comparison</label>
              <Select
                options={COMPARISON_OPTIONS}
                value={comparison}
                onChange={setComparison}
                placeholder="Select comparison..."
                isClearable
              />
            </div>

            <div className="input-group">
              <label>Value</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 25"
                min="0"
                step="0.1"
              />
            </div>

            <div className="analyze-button-container">
              <button
                onClick={handlePredictClick}
                disabled={!isFormValid || loading}
              >
                {loading ? "Predicting... (This may take up to 10 mins)" : "Predict"}
              </button>
            </div>

            {result && (
              <Box mt={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Prediction Result
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">
                          <strong>Target:</strong> {result.target_description}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>Probability:</strong> {(result.probability * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                    </Grid>

                    {result.recent_rolling_averages && (
                      <Box mt={3}>
                        <Typography variant="h6">Rolling Averages (Last 10 Games)</Typography>
                        <Grid container spacing={2} mt={1}>
                          {Object.entries(result.recent_rolling_averages)
                            .filter(([key]) => key.endsWith("_last10_avg"))
                            .map(([key, value]) => {
                              const statLabel = formatStatLabel(key);
                              return (
                                <Grid item xs={6} sm={4} key={key}>
                                  <Typography>
                                    <strong>{statLabel}:</strong>{" "}
                                    {typeof value === "number" ? value.toFixed(2) : value}
                                  </Typography>
                                </Grid>
                              );
                            })}
                        </Grid>
                      </Box>
                    )}

                    {result.last_5_games && result.last_5_games.length > 0 && (
                      <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                          Last 5 Games
                        </Typography>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">PTS</TableCell>
                                <TableCell align="right">TRB</TableCell>
                                <TableCell align="right">AST</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {result.last_5_games.map((game, index) => (
                                <TableRow key={`game-${index}`}>
                                  <TableCell>{game.date}</TableCell>
                                  <TableCell align="right">{game.pts}</TableCell>
                                  <TableCell align="right">{game.trb}</TableCell>
                                  <TableCell align="right">{game.ast}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForesightPage;