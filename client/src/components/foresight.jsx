import React from "react";

function ForesightPage() {
  const handleTestClick = async () => {
    try {
      const res = await fetch("http://localhost:3000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bbrID: "gilgesh01",
          season: 2025,
          statThresholds: [
            { key: "pts", value: 20 }
          ]
        })
      });

      const data = await res.json();
      console.log("Prediction result:", data);
      
    } catch (err) {
      console.error("Prediction error:", err);
    }
  };

  return (
    <div>
      <button onClick={handleTestClick}>Test Prediction</button>
    </div>
  );
}

export default ForesightPage;