import urllib.request, json
url = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%3Fhl%3Dvi%26gl%3DVN%26ceid%3DVN%3Avi"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if data.get('items'):
            item = data['items'][0]
            print(f"Keys: {list(item.keys())}")
            print(f"Thumbnail URL: {item.get('thumbnail')}")
            print(f"Enclosure: {item.get('enclosure')}")
except Exception as e:
    print(e)