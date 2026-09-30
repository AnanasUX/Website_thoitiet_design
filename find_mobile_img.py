import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find getNewspaperLogo in mobile layout
match = re.search(r'function MobileLayout.*?(return \(\s*<div.*?\);\s*\})', content, re.DOTALL)
if match:
    mobile_html = match.group(1)
    # Find img tags in mobile html
    imgs = re.findall(r'<img.*?/>', mobile_html)
    for img in imgs:
        if "getNewspaperLogo" in img:
            with open("mobile_img.txt", "w", encoding="utf-8") as outf:
                outf.write(img + "\n")
            break