import urllib.request
import json
import zlib
import base64

url = "https://raw.githubusercontent.com/AnanasUX/weather-bot-data/main/weather_data.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))
print("Number of articles in bot data:", len(data.get('news', [])))