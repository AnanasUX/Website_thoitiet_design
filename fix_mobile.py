import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to find the MobileLayout header structure specifically
search_pattern = r'(<div className="bg-\[#f4f6fa\] mt-1 flex items-center px-2 py-0\.5 rounded-full">.*?</div>\s*)(<button onClick=\{\(\) => setDarkMode\(!darkMode\)\} className="ml-2 w-8 h-8 rounded-full bg-\[#f4f6fa\] flex items-center justify-center text-\[#182033\] hover:bg-\[#e3e7ef\] transition-colors shrink-0">.*?</button>)'

# Replace by wrapping both in `<div className="flex items-center mt-1">`
# and removing the `mt-1` from the inner `bg-[#f4f6fa]` div so it aligns perfectly.
def repl(match):
    date_div = match.group(1).replace("mt-1 ", "")
    button = match.group(2)
    return '<div className="flex items-center mt-1">\n            ' + date_div.strip() + '\n            ' + button + '\n          </div>'

content = re.sub(search_pattern, repl, content, count=1, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed layout in MobileLayout header")