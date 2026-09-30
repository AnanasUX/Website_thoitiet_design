with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("13650000", "13750000")
content = content.replace("14150000", "14250000")
content = content.replace("13950000", "14020000")
# SJC out was 14250000 but NPQ was 14250000? Wait, old NPQ and SJC both had 14250000.
# Current SJC out: 14350000, Current NPQ out: 14320000.
# Because I want to just write a simple regex replacement for the fallback block:

import re

# Block 1
new_block1 = """const fallback = [
                { productType: '24K', productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
                { productType: 'NPQ', productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14020000, priceOut: 14320000 },
                { productType: 'SJC', productTypeName: 'Vàng miếng SJC', priceIn: 14020000, priceOut: 14350000 }
              ];"""
content = re.sub(r"const fallback = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\];", new_block1, content)

# Block 2
new_block2 = """finalGoldData = [
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14020000, priceOut: 14320000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 14020000, priceOut: 14350000 }
          ];"""
content = re.sub(r"finalGoldData = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\];", new_block2, content)

# Block 3
new_block3 = """setGoldData([
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13750000, priceOut: 14250000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 14020000, priceOut: 14320000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 14020000, priceOut: 14350000 }
          ]);"""
content = re.sub(r"setGoldData\(\[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\]\);", new_block3, content)

# Also fix setChartData to use 14350000
content = content.replace("generateDynamicData(14250000)", "generateDynamicData(14350000)")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated all 3 fallback blocks successfully.")