import urllib.request
from bs4 import BeautifulSoup
url = "https://phuquygroup.vn/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        soup = BeautifulSoup(html, "html.parser")
        # Try to find gold prices on homepage
        for td in soup.find_all('td'):
            print(td.text.strip())
except Exception as e:
    print(e)