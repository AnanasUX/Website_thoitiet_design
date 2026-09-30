import urllib.request
url = "https://api.openweathermap.org/data/2.5/uvi?lat=20&lon=105&appid=invalid_key"
try:
    req = urllib.request.Request(url)
    res = urllib.request.urlopen(req)
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))