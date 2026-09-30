import urllib.request
import json

req = urllib.request.Request('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history')
req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
req.add_header('Origin', 'https://phuquy.com.vn')
req.add_header('Referer', 'https://phuquy.com.vn/')
try:
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode('utf-8'))
    print(json.dumps(data)[:500])
except Exception as e:
    print(e)