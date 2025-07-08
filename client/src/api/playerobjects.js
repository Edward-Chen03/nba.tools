const apiURL = "http://localhost:3000/";

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

    return seasonData ? seasonData.per_game : null;

  } catch (error) {
    console.error(`Failed to fetch season stats for player ${bbrID}:`, error);
    return null; 
  }
};