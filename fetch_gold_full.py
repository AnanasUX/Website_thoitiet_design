import json
import urllib.request

req = urllib.request.Request('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history')
req.add_header('User-Agent', 'Mozilla/5.0')
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode('utf-8'))
with open("gold.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)