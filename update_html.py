with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

if '<meta name="referrer"' not in content:
    content = content.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="referrer" content="no-referrer" />')
    
with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated index.html")