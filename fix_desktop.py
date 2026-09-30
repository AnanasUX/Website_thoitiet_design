import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern for Tablet & Desktop Layouts
# They both look like:
#           <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
#             <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
#               {dateStr} A {timeStr}
#             </p>
#           </div>
#         
#             <button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-8 h-8 rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0">
#               {darkMode ? ( ... ) : ( ... )}
#             </button>
#   
#           </div>

pattern = r'(<div className="bg-\[#f4f6fa\] flex items-start px-3 py-1 rounded-full">.*?</div>)\s*(<button onClick=\{\(\) => setDarkMode\(!darkMode\)\} className="ml-2 w-8 h-8 rounded-full bg-\[#f4f6fa\] flex items-center justify-center text-\[#182033\] hover:bg-\[#e3e7ef\] transition-colors shrink-0">.*?</button>)'

def repl(match):
    date_div = match.group(1)
    button = match.group(2)
    return '<div className="flex items-center">\n            ' + date_div + '\n            ' + button + '\n          </div>'

content = re.sub(pattern, repl, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed layout in Tablet and Desktop headers")