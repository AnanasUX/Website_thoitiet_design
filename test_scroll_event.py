from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")
time.sleep(3)

driver.execute_script("""
    window.scrollFired = 0;
    window.addEventListener("scroll", () => { window.scrollFired++; });
""")

driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
time.sleep(1)

count = driver.execute_script("return window.scrollFired;")
print("Scroll Fired:", count)

driver.quit()