import urllib.request
import json
url = "https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(e)