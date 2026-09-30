css_add = """

/* Apple-style Dark Mode */
html.dark {
  color-scheme: dark;
}

html.dark body {
  background-color: #000000 !important;
  color: #f5f5f7 !important;
}

html.dark .bg-white {
  background-color: #1c1c1e !important;
}

html.dark .bg-\\[\\#f4f6fa\\] {
  background-color: #000000 !important;
}

html.dark .text-\\[\\#182033\\] {
  color: #ffffff !important;
}

html.dark .text-\\[\\#5f687b\\] {
  color: #98989d !important;
}

html.dark .border-\\[\\#e3e7ef\\] {
  border-color: #38383a !important;
}

html.dark .border-white {
  border-color: #1c1c1e !important;
}

html.dark .bg-\\[\\#f8fafc\\] {
  background-color: #2c2c2e !important;
}

html.dark .bg-\\[\\#e3e7ef\\] {
  background-color: #3a3a3c !important;
}

html.dark .shadow-\\[0px_4px_12px_0px_rgba\\(23\\,33\\,51\\,0\\.1\\)\\] {
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.5) !important;
}

html.dark .bg-gradient-to-r.from-\\[\\#f0f4ff\\].to-\\[\\#f8fafc\\] {
  background: linear-gradient(to right, #2c2c2e, #1c1c1e) !important;
}
"""

with open("src/index.css", "a", encoding="utf-8") as f:
    f.write(css_add)

print("Added Dark Mode CSS")