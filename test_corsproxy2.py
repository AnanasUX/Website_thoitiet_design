import urllib.request
import json
url = "https://corsproxy.io/?" + urllib.parse.quote("https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode()[:100])
except Exception as e:
    print(e)