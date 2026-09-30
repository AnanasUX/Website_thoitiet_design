import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# DesktopLayout Fix
# Target: <div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
# Then <div className="flex gap-[var(--grid-gap)] items-center">
# Then <p ... Anx ... </p>
# Then <div className="flex items-center">
# We want to change the second <div className="flex items-center"> to be a sibling of the first one, not a child!

def fix_header(match):
    # match.group(0) is the entire `justify-between` div until the end of the Anx <p>
    return f'{match.group(1)}\n          </div>'

pattern_desktop = r'(<div className="bg-white border-b border-\[\#e3e7ef\] flex h-\[var\(--header-height\)\] items-center justify-between px-\[var\(--page-padding\)\] w-full shrink-0 max-w-\[1200px\] mx-auto sticky top-0 z-\[100\]">\s*<div className="flex gap-\[var\(--grid-gap\)\] items-center">\s*<p className="font-bold text-\[\#182033\] text-\[18px\] whitespace-nowrap">Anx\.</p>)'

# Oh wait, TabletLayout uses text-[#ff315f] text-[20px] and DesktopLayout uses text-[#182033] text-[18px].
# Let's fix DesktopLayout first
if re.search(pattern_desktop, content):
    content = re.sub(pattern_desktop, fix_header, content)

# Now check TabletLayout just in case it is also broken.
# Wait, I previously ran a script on TabletLayout:
# <p className="font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
# <p className="font-medium text-[#5f687b] text-[13px] whitespace-nowrap">
#   📍 {WEATHER.location}
# </p>
# </div>
# <div className="flex items-center">
# This one is already correct because `</div>` is closing the left group!

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Regex replace applied.")