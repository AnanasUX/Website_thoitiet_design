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
        time.sleep(5)
        
        for log in driver.get_log('browser'):
            print(log)
    else:
        print("Button not found!")
except Exception as e:
    print("ERR", e)
finally:
    proc.kill()
    driver.quit()