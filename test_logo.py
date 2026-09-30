from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)
driver.get("https://ananasux.github.io/Website_thoitiet_design/")

result = driver.execute_script("""
    function getNewspaperLogo(url) {
      if (!url || typeof url !== 'string') return "NOT_STRING";
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        return "CATCH_ERROR";
      }
    }
    return getNewspaperLogo("https://vnexpress.net/hai-nan-nhan-vu-con-re-dam-gia-dinh-vo-qua-con-nguy-kich-5124765.html");
""")
print("getNewspaperLogo Output:", result)

driver.quit()