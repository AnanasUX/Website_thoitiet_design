from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")
time.sleep(3)
with open("test_out.html", "w", encoding="utf-8") as f:
    f.write(driver.find_element("id", "root").get_attribute("innerHTML"))
driver.quit()