import urllib.request
try:
    req = urllib.request.Request("https://docs.google.com/document/d/1a9_qNqFEpbmuIoKuEvT3cExHzpszov4THOfm1ztCZc8/export?format=txt", headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10)
    print(res.read().decode('utf-8')[:1000])
except Exception as e:
    print(e)