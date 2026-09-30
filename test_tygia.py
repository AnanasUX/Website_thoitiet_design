import urllib.request
url = "https://tygia.com/json.php?ran=1&rate=0&gold=1&bank=VIETCOM&date=now"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Success!", response.read().decode('utf-8')[:200])
except Exception as e:
    print(e)