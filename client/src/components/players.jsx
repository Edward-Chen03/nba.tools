import React, { useState, useEffect } from "react";
import { useAlphabetPlayerStats } from "../api/seasonstats";
import { PLAYER_ICON_URL } from "../api/playerobjects";
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

const PLAYERS_PER_PAGE = 8;
const SEARCH_DEBOUNCE_DELAY = 500;
const FEW_RESULTS_THRESHOLD = 3;

const TABLE_HEADERS = [
  { id: "number", label: "#" },
  { id: "player", label: "Player" },
  { id: "team", label: "Team" }
];

const SEARCH_FIELD_STYLES = {
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
};

function PlayersPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); 
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const { playerStats, loading, hasMore } = useAlphabetPlayerStats(page, PLAYERS_PER_PAGE, search);

  const hasFewResults = playerStats.length <= FEW_RESULTS_THRESHOLD;
  const tableClassName = `players-table ${hasFewResults ? 'has-few-results' : 'has-many-results'}`;
  const isFirstPage = page === 1;
  const isPaginationDisabled = loading;

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handlePreviousPage = () => {
    if (!isFirstPage && !isPaginationDisabled) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore && !isPaginationDisabled) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePlayerClick = (bbrID) => {
    navigate(`/player/${bbrID}`);
  };

  const handleImageError = (event) => {
    event.target.style.visibility = "hidden";
  };

  // Helper functions
  const calculatePlayerNumber = (index) => {
    return (page - 1) * PLAYERS_PER_PAGE + index + 1;
  };

  const renderTableHeaders = () => (
    <TableHead>
      <TableRow>
        {TABLE_HEADERS.map(header => (
          <TableCell key={header.id}>{header.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderPlayerRow = (player, index) => (
    <TableRow
      key={player.bbrID}
      hover
      className="clickable-row"
      onClick={() => handlePlayerClick(player.bbrID)}
    >
      <TableCell>{calculatePlayerNumber(index)}</TableCell>
      <TableCell>
        <Box className="player-cell">
          <Avatar
            alt={player.name}
            src={`${PLAYER_ICON_URL}${player.headshot_icon}`}
            sx={{ width: 50, height: 50 }}
            imgProps={{ onError: handleImageError }}
          />
          <span className="player-name-text">{player.name}</span>
        </Box>
      </TableCell>
      <TableCell>{player.currentTeam}</TableCell>
    </TableRow>
  );

  const renderLoadingState = () => (
    <Box className="loading-container">
      <CircularProgress sx={{ color: '#ffffff' }} />
    </Box>
  );

  const renderPlayersTable = () => (
    <TableContainer component={Paper} className={tableClassName}>
      <Table stickyHeader>
        {renderTableHeaders()}
        <TableBody>
          {playerStats.map(renderPlayerRow)}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPaginationControls = () => (
    <Box className="pagination-controls">
      <Button 
        variant="contained" 
        onClick={handlePreviousPage} 
        disabled={isFirstPage || isPaginationDisabled}
      >
        Previous
      </Button>
      <span className="pagination-page">Page {page}</span>
      <Button 
        variant="contained" 
        onClick={handleNextPage} 
        disabled={!hasMore || isPaginationDisabled}
      >
        Next
      </Button>
    </Box>
  );

  return (
    <Box className="players-page-container">
      <Typography variant="h4" component="h1" className="players-heading">
        Browse Players
      </Typography>

      <Box className="search-controls">
        <TextField
          fullWidth
          placeholder="Search players by name..."
          variant="outlined"
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
          sx={SEARCH_FIELD_STYLES}
        />
      </Box>

      {loading && isFirstPage ? renderLoadingState() : renderPlayersTable()}

      {!loading && hasFewResults && <Box sx={{ flex: 1 }} />}
      
      {renderPaginationControls()}
    </Box>
  );
}

export default PlayersPage;