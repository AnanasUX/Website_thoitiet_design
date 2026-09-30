import urllib.request
from bs4 import BeautifulSoup
url = "https://phuquygroup.vn/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        soup = BeautifulSoup(html, "html.parser")
        texts = []
        for el in soup.find_all(['td', 'span', 'div']):
            t = el.text.strip()
            if 'SJC' in t or '999' in t or '24K' in t:
                texts.append(t)
        
        with open("pq_home.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(texts))
except Exception as e:
    print(e)