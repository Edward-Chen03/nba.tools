from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List
from predictionNBA import predict_player_multistat 

app = FastAPI()

class StatThreshold(BaseModel):
    key: str
    op: str
    value: float
    
class PredictionRequest(BaseModel):
    bbrID: str
    season: int = 2025
    statThresholds: List[StatThreshold]

@app.post("/predict")
async def predict(request: PredictionRequest):
    result = predict_player_multistat(
        bbrID=request.bbrID,
        season=request.season,
        stat_thresholds=[
            {"key": s.key, "op": s.op, "value": s.value}
            for s in request.statThresholds
        ]
    )
    return result