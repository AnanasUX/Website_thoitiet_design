import os

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

overrides = """
html.dark .bg-\\[\\#eff6ff\\] {
  background-color: #1c1c1e !important;
}

html.dark .bg-\\[\\#ffe8ee\\] {
  background-color: #2c2c2e !important;
}

html.dark .bg-\\[\\#fff4e5\\] {
  background-color: #2c2c2e !important;
}
"""

if "#eff6ff" not in css:
    css = css + overrides
    with open("src/index.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Added remaining overrides")