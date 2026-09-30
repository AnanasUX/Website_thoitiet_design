import urllib.request
import sys

apiKey = "a201c471567522a7d0b7a0567ad245fe"
lat = 20.9716
lon = 105.7725

url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={apiKey}&units=metric"
try:
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req)
    print("OneCall 3.0 works!")
except Exception as e:
    print("OneCall 3.0 failed:", e)

url2 = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={apiKey}&units=metric"
try:
    req2 = urllib.request.Request(url2)
    res2 = urllib.request.urlopen(req2)
    print("OneCall 2.5 works!")
except Exception as e:
    print("OneCall 2.5 failed:", e)