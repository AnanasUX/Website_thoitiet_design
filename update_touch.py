import re
with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

css = css.replace("touch-action: manipulation;", "touch-action: pan-x pan-y;")
if "touch-action: pan-x pan-y;" not in css:
    css = css.replace("body {", "html, body {\n  touch-action: pan-x pan-y;\n}\n\nbody {")

with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(css)
print("Updated touch-action")