import React, { useState, useEffect } from "react";
import { useAlphabetPlayerStats } from "../api/seasonstats";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import "./css/player.css";

function PlayersPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const limit = 8; 

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const { playerStats, loading, hasMore } = useAlphabetPlayerStats(page, limit, search);

  const hasFewResults = playerStats.length <= 3;
  const tableClassName = `players-table ${hasFewResults ? 'has-few-results' : 'has-many-results'}`;

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handlePlayerClick = (bbrID) => {
    navigate(`/player/${bbrID}`);
  };

  return (
    <Box className="players-page-container">
      <Typography variant="h4" component="h1" className="players-heading">
        Browse Players
      </Typography>

      <Box className="search-controls">
        <TextField
          fullWidth
          placeholder="🔍 Search players by name..."
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '25px',
              color: '#ffffff',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1,
            },
          }}
        />
      </Box>

      {loading && page === 1 ? (
        <Box className="loading-container">
          <CircularProgress sx={{ color: '#ffffff' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className={tableClassName}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playerStats.map((player, index) => (
                <TableRow
                  key={player.bbrID}
                  hover
                  className="clickable-row"
                  onClick={() => handlePlayerClick(player.bbrID)}
                >
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <Box className="player-cell">
                      <Avatar
                        alt={player.name}
                        src={`http://localhost:3000/player/icon/${player.headshot_icon}`}
                        sx={{ width: 50, height: 50 }}
                        imgProps={{ onError: (e) => { e.target.style.visibility = "hidden"; } }}
                      />
                      <span className="player-name-text">{player.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell>{player.currentTeam}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && hasFewResults && <Box sx={{ flex: 1 }} />}
      
      <Box className="pagination-controls">
        <Button variant="contained" onClick={handlePrev} disabled={page === 1 || loading}>
          Previous
        </Button>
        <span className="pagination-page">Page {page}</span>
        <Button variant="contained" onClick={handleNext} disabled={!hasMore || loading}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default PlayersPage;