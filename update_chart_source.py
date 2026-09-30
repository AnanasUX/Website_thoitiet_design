import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic1 = 'const sjcPrice = finalGoldData.find(d => d.productTypeName.toLowerCase().includes("sjc"))?.priceOut || 14350000;'
new_logic1 = 'const ringPrice = finalGoldData.find(d => d.productTypeName.toLowerCase().includes("nhẫn"))?.priceOut || 14320000;'

old_logic2 = 'setChartData(prev => prev.real.length ? prev : generateDynamicData(sjcPrice));'
new_logic2 = 'setChartData(prev => prev.real.length ? prev : generateDynamicData(ringPrice));'

old_logic3 = 'setChartData(prev => prev.real.length ? prev : generateDynamicData(14350000));'
new_logic3 = 'setChartData(prev => prev.real.length ? prev : generateDynamicData(14320000));'

if old_logic1 in content:
    content = content.replace(old_logic1, new_logic1)
    content = content.replace(old_logic2, new_logic2)
    content = content.replace(old_logic3, new_logic3)
    print("Updated to use Nhẫn tròn price.")
else:
    print("Could not find sjcPrice extraction logic.")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)