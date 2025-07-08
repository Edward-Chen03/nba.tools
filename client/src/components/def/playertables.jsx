import React from 'react';

const formatStatKey = (key) => {
  return key.replace(/_/g, ' ').toUpperCase();
};

const StatsTable = ({ title, stats }) => {
  if (!stats) return null;

  const statEntries = Object.entries(stats);

  return (
    <div className="stats-category">
      <h4>{title}</h4>
      <table className="stats-table">
        <thead>
          <tr>
            {statEntries.map(([key]) => (
              <th key={key}>{formatStatKey(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {statEntries.map(([key, value]) => (
              <td key={key}>{value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;