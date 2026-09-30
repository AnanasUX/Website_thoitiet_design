from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")
time.sleep(3)

print("Title len:", len(driver.title))
print("Root len:", len(driver.find_element("id", "root").get_attribute("innerHTML")))

logs = driver.get_log("browser")
for log in logs:
    print(log['level'], log['message'])

driver.quit()