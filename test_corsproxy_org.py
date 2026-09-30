import urllib.request
import urllib.parse
import json
url = "https://corsproxy.org/?" + urllib.parse.quote("https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
        print("Success! Got", len(data.get('data', [])), "items.")
except Exception as e:
    print(e)