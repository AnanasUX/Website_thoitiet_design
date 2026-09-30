import urllib.request
try:
    req = urllib.request.Request("https://docs.google.com/document/d/1a9_qNqFEpbmuIoKuEvT3cExHzpszov4THOfm1ztCZc8/export?format=txt", headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=15)
    text = res.read().decode('utf-8')
    
    with open("doc_content.txt", "w", encoding="utf-8") as f:
        f.write(text)
        
    print(text[:1500])
except Exception as e:
    print(e)