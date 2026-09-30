import urllib.request
import json
url = "https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for item in data.get('data', []):
            print(f"{item.get('productType')}: in={item.get('priceIn')}, out={item.get('priceOut')}")
except Exception as e:
    print(e)