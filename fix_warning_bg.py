import os

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

overrides = """
html.dark .bg-\\[\\#fff7ed\\] {
  background-color: #1c1c1e !important;
}

html.dark .bg-\\[\\#f0fdf4\\] {
  background-color: #1c1c1e !important;
}
"""

if "#fff7ed" not in css:
    css = css + overrides
    with open("src/index.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Added overrides to index.css")
else:
    print("Overrides already exist")