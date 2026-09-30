import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add toSlug function outside the component
to_slug_func = """
function toSlug(str: string) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, '');
}
"""

idx_app = content.find("export default function App() {")
content = content[:idx_app] + to_slug_func + "\n" + content[idx_app:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added toSlug function.")