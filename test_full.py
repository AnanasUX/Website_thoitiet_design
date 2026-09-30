import subprocess
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# build first
subprocess.run("npm run build", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")

# run python server in dist, BUT map the assets correctly!
# In Vite, base is /Website_thoitiet_design/. So we must run server from the parent folder of dist, and rename dist to Website_thoitiet_design temporarily.
import shutil
import os

if os.path.exists("Website_thoitiet_design_temp"):
    shutil.rmtree("Website_thoitiet_design_temp")
os.rename("dist", "Website_thoitiet_design_temp")

proc = subprocess.Popen("python -m http.server 4176", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")
time.sleep(3)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

try:
    # URL matches the base path
    driver.get("http://localhost:4176/Website_thoitiet_design_temp/index.html")
    time.sleep(5)
    
    # Dump console logs to check for errors
    print("LOGS BEFORE CLICK:")
    for log in driver.get_log('browser'):
        print(log)
    
    initial = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
    print("Initial items:", initial)
    
    # Scroll to bottom to trigger observer
    driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
    time.sleep(2)
    
    # Try clicking the button just in case observer fails
    buttons = driver.find_elements("xpath", "//button[contains(text(), 'Tải thêm')]")
    if buttons:
        print("Button found! Clicking...")
        driver.execute_script("arguments[0].click();", buttons[0])
    
    time.sleep(5)
    
    print("LOGS AFTER CLICK:")
    for log in driver.get_log('browser'):
        print(log)
        
    after = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
    print("After items:", after)
except Exception as e:
    print("ERR", e)
finally:
    proc.kill()
    driver.quit()
    os.rename("Website_thoitiet_design_temp", "dist")