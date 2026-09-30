import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
apiKey = "a201c471567522a7d0b7a0567ad245fe"
lat = 20.9716
lon = 105.7725

url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apiKey}&units=metric&lang=vi"
req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))
for item in data['list'][:5]:
    print(item['dt_txt'], item['main']['temp'], item['weather'][0]['icon'], item.get('pop', 0))