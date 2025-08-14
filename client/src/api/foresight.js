export const predictPlayerOutcome = async ({ bbrID, season, statThresholds }) => {
  try {
    const res = await fetch("https://nba-tools-server.onrender.com/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bbrID, season, statThresholds })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error: ${errText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Prediction API error:", err);
    throw err;
  }
};
