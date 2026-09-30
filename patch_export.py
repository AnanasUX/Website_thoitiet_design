import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the export default mistake
content = content.replace("export default function getProxyImageUrl", "export function getProxyImageUrl")
if "export default function App() {" not in content:
    content = content.replace("function App() {", "export default function App() {")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")