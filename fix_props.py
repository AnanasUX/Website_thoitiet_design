import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the layout signatures
def update_signature(match):
    name = match.group(1)
    # The signature looks like: function MobileLayout({ activeCategory, setActiveCategory, condKey, liveData, liveNews, isFetchingCategory, liveOverrides }: any)
    # Wait, the codebase might just be using inline types or any.
    return match.group(0).replace("isFetchingCategory,", "isFetchingCategory, darkMode, setDarkMode,")

content = re.sub(r'(function MobileLayout\(\{\s*activeCategory,\s*setActiveCategory,\s*isFetchingCategory,)', update_signature, content)
content = re.sub(r'(function TabletLayout\(\{\s*activeCategory,\s*setActiveCategory,\s*isFetchingCategory,)', update_signature, content)
content = re.sub(r'(function DesktopLayout\(\{\s*activeCategory,\s*setActiveCategory,\s*isFetchingCategory,)', update_signature, content)

# 2. Update the calls in App()
def update_call(match):
    return match.group(0).replace("isFetchingCategory={isFetchingCategory}", "isFetchingCategory={isFetchingCategory} darkMode={darkMode} setDarkMode={setDarkMode}")

content = re.sub(r'(<MobileLayout\s+activeCategory={activeCategory}.*?isFetchingCategory={isFetchingCategory})', update_call, content)
content = re.sub(r'(<TabletLayout\s+activeCategory={activeCategory}.*?isFetchingCategory={isFetchingCategory})', update_call, content)
content = re.sub(r'(<DesktopLayout\s+activeCategory={activeCategory}.*?isFetchingCategory={isFetchingCategory})', update_call, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected props into Layouts")