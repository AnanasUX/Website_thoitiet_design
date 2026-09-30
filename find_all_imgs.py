import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

imgs = re.findall(r'<img[^>]*getNewspaperLogo[^>]*>', content)
for img in imgs:
    with open("all_imgs.txt", "a", encoding="utf-8") as outf:
        outf.write(img + "\n")