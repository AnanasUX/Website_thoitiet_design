from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")

time.sleep(3)

h1 = driver.execute_script("return window.innerHeight;")
y1 = driver.execute_script("return window.scrollY;")
sh1 = driver.execute_script("return document.documentElement.scrollHeight;")
print(f"Before: innerHeight={h1}, scrollY={y1}, scrollHeight={sh1}")

driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
time.sleep(1)

h2 = driver.execute_script("return window.innerHeight;")
y2 = driver.execute_script("return window.scrollY;")
sh2 = driver.execute_script("return document.documentElement.scrollHeight;")
print(f"After: innerHeight={h2}, scrollY={y2}, scrollHeight={sh2}")

driver.quit()