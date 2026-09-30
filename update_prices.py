import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update prices based on user provided screenshot for 24/09/2026:
# Xăng E10 RON 95-III: 27.080
# Xăng E5 RON 92-II: 26.390

content = content.replace("{ name: 'Xăng E10', price: '21.320' }", "{ name: 'Xăng E10', price: '27.080' }")
content = content.replace("{ name: 'Xăng E5', price: '20.420' }", "{ name: 'Xăng E5', price: '26.390' }")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated petrol prices to match actual data.")