import pandas as pd
import requests

pd.set_option('display.max_rows', None) 
pd.set_option('display.max_columns', None)

url = "https://www.basketball-reference.com/leagues/NBA_2025_per_game.html"

html_content = requests.get(url).content

dfs = pd.read_html(html_content, attrs={'id': 'per_game_stats'})

if dfs:
    df = dfs[0]
    with open('server/scraper/nba_stats_output.txt', 'w', encoding='utf-8') as f:

        f.write(df.to_string())
else:
    print("error")
