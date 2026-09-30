import urllib.request
apiKey = "a201c471567522a7d0b7a0567ad245fe"
url = f"https://api.openweathermap.org/data/2.5/uvi?lat=20.9716&lon=105.7725&appid={apiKey}"
try:
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req)
    print(res.read().decode('utf-8'))
except Exception as e:
    print("UVI failed:", e)