import urllib.request
import json

apiKey = "a201c471567522a7d0b7a0567ad245fe"
lat = 20.9716
lon = 105.7725

urls = [
    f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={apiKey}",
    f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={apiKey}",
    f"https://pro.openweathermap.org/data/2.5/forecast/hourly?lat={lat}&lon={lon}&appid={apiKey}"
]

for u in urls:
    try:
        req = urllib.request.Request(u)
        res = urllib.request.urlopen(req)
        print(u, "-> SUCCESS")
    except urllib.error.HTTPError as e:
        print(u, "-> FAILED:", e.code)