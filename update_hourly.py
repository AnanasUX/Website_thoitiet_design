import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("DỰ BÁO HÀNG GIỜ (HOURLY)", "DỰ BÁO HÀNG GIỜ")
# Handle potential encoding issues from previous manual edits or whatever
content = content.replace("D\u1ef0 B\u00c1O H\u00c0NG GI\u1edc (HOURLY)", "D\u1ef0 B\u00c1O H\u00c0NG GI\u1edc")
content = content.replace("D\u1ef0 B\u00c1O H\u00c0NG GI\u1edc (HOURLY)", "DỰ BÁO HÀNG GIỜ")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated HOURLY text.")