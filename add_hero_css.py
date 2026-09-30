import os

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

overrides = """
.hero-gradient {
  background: linear-gradient(21deg, rgb(72, 141, 203) 0%, rgb(51, 106, 214) 50%, rgb(79, 196, 255) 100%);
}

html.dark .hero-gradient {
  background: linear-gradient(21deg, rgb(23, 43, 115) 0%, rgb(18, 28, 48) 50%, rgb(41, 76, 194) 100%) !important;
}
"""

if ".hero-gradient" not in css:
    css = css + overrides
    with open("src/index.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Added hero-gradient classes to index.css")