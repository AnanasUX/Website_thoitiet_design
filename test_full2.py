import subprocess
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# build first
subprocess.run("npm run build", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design")

import shutil
import os

# Copy dist to parent directory as Website_thoitiet_design_test
test_dir = "D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design_test"
if os.path.exists(test_dir):
    shutil.rmtree(test_dir)
shutil.copytree("D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48/Website_thoitiet_design/dist", test_dir)

# Run server in parent directory
proc = subprocess.Popen("python -m http.server 4177", shell=True, cwd="D:/Downloads_Phanmem/Chrome/quan-ly-tien-phong-22h48")
time.sleep(3)

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

try:
    # URL matches the base path BUT we named the folder Website_thoitiet_design_test! 
    # Wait! If Vite requests /Website_thoitiet_design/assets/... it will 404!
    # We MUST name the folder Website_thoitiet_design! 
    # BUT Website_thoitiet_design is the original repo!
    pass
except Exception as e:
    pass
finally:
    proc.kill()
    driver.quit()