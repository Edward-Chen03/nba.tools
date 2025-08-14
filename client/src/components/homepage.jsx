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
  Fade,
} from "@mui/material";
import { useLeaderboardStats } from "../api/seasonstats";
import { PLAYER_ICON_URL } from "../api/playerobjects";
import "./css/homepage.css";

const PLAYERS_PER_PAGE = 8;
const CURRENT_SEASON = "2024–25";
const AVATAR_SIZE = 45;
const DECIMAL_PLACES = 1;

const LEADERBOARD_HEADERS = [
  { id: "rank", label: "#" },
  { id: "player", label: "Player" },
  { id: "team", label: "Team" },
  { id: "pts", label: "PTS" },
  { id: "ast", label: "AST" },
  { id: "trb", label: "TRB" },
  { id: "total", label: "Total" }
];

function Homepage() {
  const [page, setPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { leaderboardStats, loading, hasMore } = useLeaderboardStats(page, PLAYERS_PER_PAGE);

  const isFirstPage = page === 1;
  const isPaginationDisabled = loading || isTransitioning;
  const showLoadingOverlay = loading && leaderboardStats.length === 0; 
  const showContent = !showLoadingOverlay;

  
  const handleNextPage = async () => {
    if (hasMore && !isPaginationDisabled) {
      setIsTransitioning(true);
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handlePreviousPage = async () => {
    if (!isFirstPage && !isPaginationDisabled) {
      setIsTransitioning(true);
      setTimeout(() => {
        setPage(prevPage => prevPage - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleImageError = (event) => {
    event.target.style.visibility = "hidden";
  };

  const calculatePlayerRank = (index) => {
    return (page - 1) * PLAYERS_PER_PAGE + index + 1;
  };

  const formatStatValue = (value) => {
    return value ?? 'N/A';
  };

  const formatTotalContribution = (total) => {
    return typeof total === 'number' ? total.toFixed(DECIMAL_PLACES) : 'N/A';
  };

  const renderTableHeaders = () => (
    <TableHead>
      <TableRow>
        {LEADERBOARD_HEADERS.map(header => (
          <TableCell key={header.id}>{header.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderPlayerAvatar = (player) => {
    if (!player.playerObject?.headshot_icon) return null;

    return (
      <Avatar
        alt={player.playerObject.name}
        src={`${PLAYER_ICON_URL}${player.playerObject.headshot_icon}`}
        sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        imgProps={{ onError: handleImageError }}
      />
    );
  };

  const renderPlayerCell = (player) => (
    <Box className="player-cell">
      {renderPlayerAvatar(player)}
      <span className="player-name-text">
        {player.playerObject?.name || 'Unknown Player'}
      </span>
    </Box>
  );

  const renderPlayerRow = (player, index) => (
    <TableRow key={player.player_bbrID} hover>
      <TableCell>{calculatePlayerRank(index)}</TableCell>
      <TableCell>{renderPlayerCell(player)}</TableCell>
      <TableCell>{player.playerObject?.currentTeam || 'N/A'}</TableCell>
      <TableCell>{formatStatValue(player.per_game?.pts)}</TableCell>
      <TableCell>{formatStatValue(player.per_game?.ast)}</TableCell>
      <TableCell>{formatStatValue(player.per_game?.trb)}</TableCell>
      <TableCell>{formatTotalContribution(player.totalContribution)}</TableCell>
    </TableRow>
  );

  const renderLoadingState = () => (
    <Box className="loading-container">
      <CircularProgress />
    </Box>
  );

  const renderLeaderboardTable = () => (
    <Fade in={!isTransitioning} timeout={200}>
      <TableContainer component={Paper} className="leaderboard-table">
        <Table stickyHeader>
          {renderTableHeaders()}
          <TableBody>
            {leaderboardStats.map(renderPlayerRow)}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
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

  const renderPageTitle = () => (
    <Typography variant="h5" component="h2" className="homepage-heading">
      {CURRENT_SEASON} Statistical Leaders
    </Typography>
  );

  return (
    <Box className="homepage-container">
      {renderPageTitle()}
      {showLoadingOverlay ? renderLoadingState() : renderLeaderboardTable()}
      {renderPaginationControls()}
    </Box>
  );
}

export default Homepage;