import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://cdn.dantri.com.vn/dantri-favicon.ico", "https://dantri.com.vn/favicon.ico")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated dantri favicon URL")