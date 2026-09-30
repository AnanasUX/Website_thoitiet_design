import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace let sjcPrice = 14250000;
content = content.replace('let sjcPrice = 14250000;', 'let chartBasePrice = 14320000;')

old_block = """const sjc = finalGoldData.find((i: any) => i.productType === 'SJC') || finalGoldData[0];
              sjcPrice = sjc.priceOut;"""
new_block = """const npq = finalGoldData.find((i: any) => i.productType === 'NPQ') || finalGoldData[1];
              chartBasePrice = npq.priceOut;"""
content = content.replace(old_block, new_block)

content = content.replace('generateDynamicData(sjcPrice)', 'generateDynamicData(chartBasePrice)')
content = content.replace('generateDynamicData(14350000)', 'generateDynamicData(14320000)')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated chart base price to NPQ (Nhẫn tròn).")