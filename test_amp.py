import urllib.request
import urllib.parse
raw_url = "https://vcdn1-suckhoe.vnecdn.net/2026/09/25/e-ki-p-pha-u-thua-t-1790323451-7214-1790323592.png?w=1200&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=N4zgrxY9nFTvKroOBl0a-g"
wsrv_raw = f"https://wsrv.nl/?url={urllib.parse.quote(raw_url)}"
wsrv_decoded = f"https://wsrv.nl/?url={urllib.parse.quote(raw_url.replace('&amp;', '&'))}"

try:
    print("Raw len:", len(urllib.request.urlopen(urllib.request.Request(wsrv_raw, headers={'User-Agent': 'Mozilla/5.0'})).read()))
except Exception as e:
    print("Raw error:", e)

try:
    print("Decoded len:", len(urllib.request.urlopen(urllib.request.Request(wsrv_decoded, headers={'User-Agent': 'Mozilla/5.0'})).read()))
except Exception as e:
    print("Decoded error:", e)