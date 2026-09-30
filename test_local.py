from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import subprocess
import os

# Start static server
print("Starting server...")
proc = subprocess.Popen("npx serve -s dist -l 4173", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")
time.sleep(3)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("http://localhost:4173/")

time.sleep(5)
initial = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
print("Initial items:", initial)

driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
time.sleep(5)

after = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
print("After items:", after)

proc.kill()
driver.quit()