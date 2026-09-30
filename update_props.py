with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Props in MobileLayout, TabletLayout, DesktopLayout
# DesktopLayout
import re
content = re.sub(r'(function DesktopLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)

# TabletLayout
content = re.sub(r'(function TabletLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)

# MobileLayout
content = re.sub(r'(function MobileLayout\(\{.*?)(condKey,)(.*?\}: \{.*?)(condKey: ConditionKey;)', r'\1isFetchingCategory,\n    \2\3isFetchingCategory?: boolean;\n    \4', content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Layout Props")