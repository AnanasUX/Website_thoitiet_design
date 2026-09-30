from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")
time.sleep(3)

print("Body height:", driver.execute_script("return document.body.scrollHeight;"))
print("Root height:", driver.execute_script("return document.getElementById('root').scrollHeight;"))
print("App wrapper height:", driver.execute_script("return document.getElementById('root').firstElementChild.scrollHeight;"))
print("Window innerHeight:", driver.execute_script("return window.innerHeight;"))

driver.quit()