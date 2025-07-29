import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from '@mui/material';


const formatStatKey = (key) => key.replace(/_/g, ' ').toUpperCase();

const StatsTable = ({ title, stats }) => {
  if (!stats) return null;
  const statEntries = Object.entries(stats);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {statEntries.map(([key]) => (
                <TableCell key={key} align="center" style={{ fontWeight: 'bold' }}>
                  {formatStatKey(key)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {statEntries.map(([key, value]) => (
                <TableCell key={key} align="center">{value}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StatsTable;