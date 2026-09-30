import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace <button onClick={() => setDarkMode(!darkMode)} ... > with <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} ... >
content = content.replace(
    '<button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">',
    '<div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 cursor-pointer">'
)

content = content.replace('</button>\n          </div>', '</div>\n          </div>')
# Wait, let's just do a regex for the closing tag of the button
content = re.sub(r'(<div onClick=\{\(\) => setDarkMode\(!darkMode\)\}.*?</svg>\s*\)\})\s*</button>', r'\1\n            </div>', content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced button with div")