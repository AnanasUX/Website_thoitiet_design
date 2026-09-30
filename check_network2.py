from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import json

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})

driver = webdriver.Chrome(options=options)
driver.get("https://phuquy.com.vn/bang-gia/vang")
time.sleep(5)

logs = driver.get_log('performance')
urls = []
for entry in logs:
    log = json.loads(entry['message'])['message']
    if 'Network.requestWillBeSent' in log['method']:
        if 'request' in log['params'] and 'url' in log['params']['request']:
            url = log['params']['request']['url']
            if 'api' in url.lower() or 'vang' in url.lower() or 'price' in url.lower() or 'json' in url.lower():
                urls.append(url)

print("\n".join(set(urls)))
driver.quit()