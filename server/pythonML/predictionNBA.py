import pandas as pd
import numpy as np
import os
from pymongo import MongoClient
from lightgbm import LGBMClassifier
import operator

op_map = {
    ">": operator.gt,
    "<": operator.lt,
    ">=": operator.ge,
    "<=": operator.le,
    "==": operator.eq
}

def convert_min_str_to_float(min_str):
    try:
        mins, secs = map(int, min_str.split(':'))
        return mins + secs / 60
    except:
        return None

def predict_player_multistat(
    bbrID: str,
    season: int = 2025,
    stat_thresholds: list = None 
):
    if not stat_thresholds:
        raise ValueError("You must provide at least one (stat, threshold) pair in stat_thresholds.")
    
    db_uri = os.getenv("NBAMONGO")
    client = MongoClient(db_uri)
    db = client['nbatools']
    players_collection = db['players']
    seasons_data = db["seasons"]

    player_doc = players_collection.find_one({"bbrID": bbrID})
    if not player_doc:
        raise ValueError(f"No player found with bbrID: {bbrID}")

    season_doc = seasons_data.find_one({"_id": player_doc.get("seasons")})
    if not season_doc:
        raise ValueError("No season data found for player.")

    current_season = [s for s in season_doc.get("seasons") if s.get("season") == season]
    if not current_season:
        raise ValueError(f"No data found for season {season}.")

    all_games = []
    for season_part in current_season:
        all_games.extend(season_part.get("games", []))

    df = pd.DataFrame(all_games)

    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    df['mp'] = df['mp'].apply(convert_min_str_to_float)
    df['home'] = df['home'].apply(lambda x: 0 if x == '@' else 1)

    all_stats = [
        'mp', 'pts', 'fg', 'fga', 'fgp', 'threep', 'threepa', 'threepap',
        'ft', 'fta', 'ftp', 'orb', 'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'gmsc'
    ]

    for col in all_stats:
        if col in df.columns:
            df[f'{col}_last10_avg'] = df[col].rolling(window=10, min_periods=5).mean().shift(1)

    df['days_rest'] = df['date'].diff().dt.days.fillna(0)

    condition_expr = []
    for threshold in stat_thresholds:
        stat = threshold["key"]
        op = threshold.get("op", ">")
        value = threshold["value"]

        if stat not in df.columns:
            raise ValueError(f"Stat '{stat}' not found in data.")
        if op not in op_map:
            raise ValueError(f"Unsupported operator '{op}' for stat '{stat}'.")

        condition_expr.append(op_map[op](df[stat], value))

    combined_target = np.logical_and.reduce(condition_expr).astype(int)
    label_suffix = "_and_".join([f"{t['key']}_{t['op'].replace('>', 'gt').replace('<', 'lt').replace('=', 'eq')}_{t['value']}" for t in stat_thresholds])
    target_col = f"target_{label_suffix}"
    df[target_col] = combined_target

    df = df.dropna(subset=[f'{col}_last10_avg' for col in all_stats if col in df.columns])

    if len(df) < 20:
        raise ValueError("Not enough data to train")

    split_idx = int(0.8 * len(df))
    X_train, X_test = df.iloc[:split_idx], df.iloc[split_idx:]
    y_train, y_test = df[target_col].iloc[:split_idx], df[target_col].iloc[split_idx:]

    features = [col for col in df.columns if 'last10_avg' in col] + ['home', 'days_rest']

    model = LGBMClassifier(
        objective='binary',
        n_estimators=150,
        max_depth=3,
        min_child_samples=10,
        reg_alpha=0.1,
        reg_lambda=0.1,
        random_state=42
    )

    model.fit(X_train[features], y_train)

    label = " AND ".join([f"{t['key'].upper()} {t['op']} {t['value']}" for t in stat_thresholds])
    recent_averages = df[features].iloc[-1].to_dict()

    played_games = df[df['mp'].notna() & (df['mp'] > 0)]
    last5_games = played_games[['date', 'pts', 'trb', 'ast']].tail(5).copy()
    last5_games['date'] = last5_games['date'].dt.strftime('%Y-%m-%d')
    last5 = last5_games.to_dict(orient="records")

    next_game_features = df[features].iloc[[-1]]
    next_game_prob = model.predict_proba(next_game_features)[0, 1]

    return {
        "player_id": bbrID,
        "season": season,
        "target_description": label,
        "probability": round(next_game_prob, 4),
        "recent_rolling_averages": recent_averages,
        "last_5_games": last5,
    }
