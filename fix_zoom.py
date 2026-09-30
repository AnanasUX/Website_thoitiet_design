import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

html = re.sub(
    r'<meta name="viewport" content="width=device-width, initial-scale=1\.0" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />',
    html
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

if "touch-action: manipulation;" not in css:
    css = css.replace("body {", "body {\n  touch-action: manipulation;\n  -webkit-text-size-adjust: 100%;\n")
    with open("src/index.css", "w", encoding="utf-8") as f:
        f.write(css)

print("Success Zoom Fix")