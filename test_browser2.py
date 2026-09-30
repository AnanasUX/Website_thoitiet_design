from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")

time.sleep(3) # Wait for React to mount and crash

logs = driver.get_log("browser")
for log in logs:
    print(log)

driver.quit()