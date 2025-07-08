import { useEffect, useState } from "react";

const apiURL = "http://localhost:3000/"

export async function fetchCustomStats(selectedStats, season = 2025, page = 1, limit = 20) {
  try {
    const response = await fetch(`${apiURL}customstats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, page, limit, stats: selectedStats })
    });

    if (!response.ok) throw new Error("Failed to fetch custom stats");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching custom stats:", error);
    return [];
  }
}
