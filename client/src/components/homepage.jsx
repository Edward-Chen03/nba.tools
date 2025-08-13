import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import { useLeaderboardStats } from "../api/seasonstats";
import "./css/homepage.css";

function Homepage() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const { leaderboardStats, loading, hasMore } = useLeaderboardStats(page, limit);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <Box className="homepage-container">
      <Typography variant="h5" component="h2" className="homepage-heading">
        2024–25 Statistical Leaders
      </Typography>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="leaderboard-table">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>PTS</TableCell>
                <TableCell>AST</TableCell>
                <TableCell>TRB</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardStats.map((player, index) => (
                <TableRow key={player.player_bbrID} hover>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <Box className="player-cell">
                      {player.playerObject.headshot_icon && (
                        <Avatar
                          alt={player.playerObject.name}
                          src={`http://localhost:3000/player/icon/${player.playerObject.headshot_icon}`}
                          sx={{ width: 45, height: 45 }}
                          imgProps={{ onError: (e) => (e.target.style.visibility = "hidden") }}
                        />
                      )}
                      <span className="player-name-text">{player.playerObject.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell>{player.playerObject.currentTeam}</TableCell>
                  <TableCell>{player.per_game?.pts}</TableCell>
                  <TableCell>{player.per_game?.ast}</TableCell>
                  <TableCell>{player.per_game?.trb}</TableCell>
                  <TableCell>{player.totalContribution.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box className="pagination-controls">
        <Button variant="contained" onClick={handlePrev} disabled={page === 1}>
          Previous
        </Button>
        <span className="pagination-page">Page {page}</span>
        <Button variant="contained" onClick={handleNext} disabled={!hasMore}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Homepage;