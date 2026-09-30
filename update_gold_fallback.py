import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_gold = """export const DEFAULT_GOLD_DATA = [
  { productTypeName: 'Vàng trang sức 999.9', priceIn: 13650000, priceOut: 14150000 },
  { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 13950000, priceOut: 14250000 },
  { productTypeName: 'Vàng miếng SJC', priceIn: 13950000, priceOut: 14250000 },
];"""

new_gold = """export const DEFAULT_GOLD_DATA = [
  { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
  { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14020000, priceOut: 14320000 },
  { productTypeName: 'Vàng miếng SJC', priceIn: 14020000, priceOut: 14350000 },
];"""

if old_gold in content:
    content = content.replace(old_gold, new_gold)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated DEFAULT_GOLD_DATA.")
else:
    print("Could not find DEFAULT_GOLD_DATA block.")