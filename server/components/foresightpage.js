const getPrediction = async (req, res) => {
  try {
    const { bbrID, season, statThresholds } = req.body;

    if (!bbrID || !Array.isArray(statThresholds) || statThresholds.length === 0) {
      return res.status(400).send("Missing required fields: bbrID and statThresholds");
    }
    console.log("Preparing parameters for prediction...")
    const response = await fetch("https://nba-toolsml.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bbrID, season, statThresholds })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Python API error:", errText);
      return res.status(500).send("Prediction service failed.");
    }

    const predictionResult = await response.json();
    res.json(predictionResult);

    console.log("Sent prediction result!")
  } catch (err) {
    console.error("Error in /predict proxy:", err);
    res.status(500).send("Failed to fetch prediction results");
  }
};

module.exports = {getPrediction}