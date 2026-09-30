from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")

time.sleep(5)
print("Initial items:", len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]")))

driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
time.sleep(5)

print("After items:", len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]")))

for log in driver.get_log("browser"):
    if log['level'] == 'SEVERE':
        print("ERR:", log)

driver.quit()