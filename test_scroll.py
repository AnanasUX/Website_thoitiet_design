from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")

# Wait for initial load
time.sleep(5)
initial_items = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
print("Initial items:", initial_items)

# Scroll to bottom
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(3) # Wait for fetchMoreNews to complete

new_items = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
print("After scroll items:", new_items)

# Log any JS errors
logs = driver.get_log("browser")
for log in logs:
    if log['level'] == 'SEVERE':
        print(log)

driver.quit()