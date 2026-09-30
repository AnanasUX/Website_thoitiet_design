import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to fix the malformed inline types.
# It looks like:
#   liveOverrides?: LiveOverrides;
# }
#     activeCategory?: string;
#     setActiveCategory?: (c: string) => void;
#     darkMode?: boolean;
#     setDarkMode?: (d: boolean) => void;) {

malformed_pattern = r'liveOverrides\?: LiveOverrides;\s*\}\s*activeCategory\?: string;\s*setActiveCategory\?: \(c: string\) => void;\s*darkMode\?: boolean;\s*setDarkMode\?: \(d: boolean\) => void;'

def fix_malformed(match):
    return "liveOverrides?: LiveOverrides;\n    activeCategory?: string;\n    setActiveCategory?: (c: string) => void;\n    darkMode?: boolean;\n    setDarkMode?: (d: boolean) => void;\n}"

content = re.sub(malformed_pattern, fix_malformed, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed Syntax Errors")