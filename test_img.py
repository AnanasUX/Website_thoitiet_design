from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")
time.sleep(4)

result = driver.execute_script("""
    // Look directly at React state if possible, but we can't easily.
    // Let's just find the imgs and their attributes!
    return Array.from(document.querySelectorAll('img.size-11')).map(img => ({
        src: img.src,
        author: img.nextElementSibling.querySelector('p').innerText
    }));
""")
for r in result:
    print(r)

driver.quit()