const apiURL = "http://localhost:3000/";

export const PLAYER_ICON_URL = `${apiURL}player/icon/`;

export const fetchAllPlayers = async () => {
  try {
  
    const response = await fetch(`${apiURL}players`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const players = await response.json();
    return players;
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return [];
  }
};

export const fetchPlayerSeasonStats = async (bbrID, targetSeason) => {
  if (!bbrID) return null;

  try {
    const response = await fetch(`${apiURL}players/${bbrID}/seasons`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const seasons = await response.json();

    const seasonData = seasons.seasons.find(s => s.season === targetSeason);

    return seasonData ? seasonData : null;

  } catch (error) {
    console.error(`Failed to fetch season stats for player ${bbrID}:`, error);
    return null; 
  }
};


export async function fetchCustomStats(season, stats, xAxis, page = 1, limit = 20) {
  const response = await fetch(`${apiURL}customstats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ season, stats, xAxis, page, limit })
  });

  if (!response.ok) throw new Error("Failed to fetch custom stats");
  return response.json();
}