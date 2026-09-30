import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add logo mapping
content = re.sub(
    r'(img:\s*item\.image \? getProxyImageUrl\(item\.image\) : images\[i % images\.length\],)',
    r'\1\n          logo: getNewspaperLogo(item.link || ""),',
    content
)

# Fix type
content = re.sub(
    r'type LiveNewsItem = \{ (img: string; fallbackImg\?: string;)',
    r'type LiveNewsItem = { \1 logo?: string;',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")