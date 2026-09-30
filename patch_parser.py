with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('parser.parseFromString(data.contents, "text/html")', 'parser.parseFromString(data.contents || "", "text/html")')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched parseFromString null crash.")