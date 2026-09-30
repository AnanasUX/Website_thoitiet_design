import urllib.request
url = "https://api.allorigins.win/raw?url=" + urllib.parse.quote("https://giavang.doji.vn/api/giavang/?api_key=258fbd2a72ce8481089d88c678e9fe4f")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Success!", response.read().decode('utf-8')[:100])
except Exception as e:
    print(e)