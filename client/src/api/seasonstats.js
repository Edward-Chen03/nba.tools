import { useEffect, useState } from "react";

const apiURL = "http://localhost:3000/"

export function useLeaderboardStats(page, limit) {
  const [leaderboardStats, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiURL}hometable?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        setHasMore(data.length === limit);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
        setHasMore(false);
        setLoading(false);
      });
  }, [page, limit]);

  return { leaderboardStats, loading, hasMore };
}

export function useAlphabetPlayerStats(page, limit, search) {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = new URL(`${apiURL}playerstable`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);
    if (search) url.searchParams.append("search", search);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPlayerStats(data);
        setHasMore(data.length === limit);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching player stats:", error);
        setPlayerStats([]);
        setHasMore(false);
        setLoading(false);
      });
  }, [page, limit, search]);

  return { playerStats, loading, hasMore };
}

export async function fetchPlayerSeasons(bbrID) {
  const response = await fetch(`${apiURL}players/${bbrID}/seasons`);
  if (!response.ok) {
    throw new Error("Failed to fetch seasons");
  }
  return response.json();
}
