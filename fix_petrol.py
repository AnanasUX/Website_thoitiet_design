import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Xng RON 95-III", "Xăng E10")
content = content.replace("Xng E5 RON 92-II", "Xăng E5")
# Just to be safe, if utf-8 decoded successfully:
content = content.replace("Xăng RON 95-III", "Xăng E10")
content = content.replace("Xăng E5 RON 92-II", "Xăng E5")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced petrol names.")