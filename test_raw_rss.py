import urllib.request
req = urllib.request.Request("https://vnexpress.net/rss/tin-moi-nhat.rss", headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
print(res.read().decode('utf-8')[:1000])