with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("GiA VAng PhA QuA", "Giá Vàng Phú Quý")
content = content.replace("BAn", "Bán")
content = content.replace("Tin tcc", "Tin tức")
content = content.replace("Th?i tit", "Thời tiết")
content = content.replace("Tin Tcc M>i Nht", "Tin Tức Mới Nhất")
content = content.replace("bAi m>i nht", "bài mới nhất")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed encoding")