from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import subprocess
import os

print("Building...")
subprocess.run("npm run build", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")

print("Starting server...")
# Run python http.server instead of npx serve to avoid issues
proc = subprocess.Popen("python -m http.server 4174 -d dist", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")
time.sleep(3)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
try:
    driver.get("http://localhost:4174/")
    time.sleep(5)
    
    initial = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
    print("Initial items:", initial)
    
    driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
    time.sleep(5)
    
    after = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
    print("After items:", after)
except Exception as e:
    print("ERR", e)
finally:
    proc.kill()
    driver.quit()