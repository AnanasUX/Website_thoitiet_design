from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("http://localhost:4173/") # Need to serve first, let's just run npm run preview in background

print("Serving...")