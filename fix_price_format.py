with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("{(item.priceIn / 1000).toLocaleString('vi-VN')}", "{item.priceIn.toLocaleString('vi-VN')}")
content = content.replace("{(item.priceOut / 1000).toLocaleString('vi-VN')}", "{item.priceOut.toLocaleString('vi-VN')}")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated price formatting")