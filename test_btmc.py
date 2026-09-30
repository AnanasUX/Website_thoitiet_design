import urllib.request
url = "https://btmc.vn/api/getpricegold"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Success!", response.read().decode('utf-8')[:200])
except Exception as e:
    print(e)