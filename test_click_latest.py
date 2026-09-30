import subprocess
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

proc = subprocess.Popen("npm run preview", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")
time.sleep(5)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:8443/Website_thoitiet_design/")
    time.sleep(5)
    
    buttons = driver.find_elements("xpath", "//button[contains(text(), 'Tải thêm')]")
    if buttons:
        driver.execute_script("arguments[0].click();", buttons[0])
        print("Clicked button!")
        time.sleep(10)
        
        for log in driver.get_log('browser'):
            print(log)
            
        after = len(driver.find_elements("css selector", ".rounded-2xl.shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\]"))
        print("After click items:", after)
    else:
        print("Button not found!")
except Exception as e:
    print("ERR", e)
finally:
    proc.kill()
    driver.quit()