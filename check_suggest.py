import sys

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("GỢI Ý LỊCH TRÌNH")
if idx != -1:
    print(content[idx:idx+500])