import re

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

# Add body default font family
if "body {" in css:
    css = css.replace("body {\n", "body {\n  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;\n")

# Add --font-sans to @theme if @theme exists
if "@theme {" in css:
    css = css.replace("@theme {\n", "@theme {\n  --font-sans: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;\n")

with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(css)
print("Success")