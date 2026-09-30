import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. DesktopLayout grouping fix
pattern_desktop = r'(<div className="bg-white border-b border-\[\#e3e7ef\] flex h-\[var\(--header-height\)\] items-center justify-between px-\[var\(--page-padding\)\] w-full shrink-0 max-w-\[1200px\] mx-auto sticky top-0 z-\[100\]">\s*<div className="flex gap-\[var\(--grid-gap\)\] items-center">\s*<p className="font-bold text-\[\#182033\] text-\[18px\] whitespace-nowrap">Anx\.</p>)'
def fix_desktop(match):
    return f'{match.group(1)}\n          </div>'
content = re.sub(pattern_desktop, fix_desktop, content)

# 2. Button to Div fix
# The original button:
# <button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">
# Replace with div:
old_btn = '<button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">'
new_btn = '<div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">'
content = content.replace(old_btn, new_btn)

# Now replace the closing </button> specifically for these toggles.
# They are followed by the SVG conditional block
#       )}
#     </button>
#     </div>
content = re.sub(r'(\s*)\}\)\s*</button>', r'\1})\n            </div>', content)

# Let's do it safer: find all `</button>` that follow the dark mode toggle SVG.
# The SVG ends with `</svg>` then `)}` then `</button>`.
content = content.replace('</svg>\n              )}\n            </button>', '</svg>\n              )}\n            </div>')
# Or maybe the spacing is different:
content = re.sub(r'</svg>\s*\)\}\s*</button>', '</svg>\n              )}\n            </div>', content)


# 3. Petrol names
content = content.replace("Xng RON 95-III", "Xăng E10")
content = content.replace("Xng E5 RON 92-II", "Xăng E5")
content = content.replace("Xăng RON 95-III", "Xăng E10")
content = content.replace("Xăng E5 RON 92-II", "Xăng E5")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("All fixes applied securely.")