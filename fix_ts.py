import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The inline interface is like:
#   }: {
#     isFetchingCategory?: boolean;
#       condKey: ConditionKey;
#     liveData?: Record<ConditionKey, WeatherEntry>;
#     liveNews?: LiveNewsItem[];
#     liveOverrides?: LiveOverrides;
#   }) {

# Let's just find that block and add the missing props
def fix_interface(match):
    return match.group(0) + "\n    activeCategory?: string;\n    setActiveCategory?: (c: string) => void;\n    darkMode?: boolean;\n    setDarkMode?: (d: boolean) => void;"

content = re.sub(r'liveOverrides\?: LiveOverrides;\s*\}', fix_interface, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS typings")