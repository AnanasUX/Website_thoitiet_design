import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's target the MobileLayout header specifically.
# The `MobileLayout` header is inside `function MobileLayout({ ... }) {`
# And it currently looks like:
# <div className="flex flex-col items-end">
#   <p className="font-medium text-[#182033] text-[12px] whitespace-nowrap text-right">
#     📍 {WEATHER.location}
#   </p>
#   <div className="flex items-center mt-1">
#     <div className="bg-[#f4f6fa] flex items-center px-2 py-0.5 rounded-full">
#       <p className="font-normal text-[#5f687b] text-[10px] whitespace-nowrap">
#         {shortDateStr} · {timeStr}
#       </p>
#     </div>
#     <button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-8 h-8 rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0">
#       ...
#     </button>
#   </div>
# </div>

# Let's extract this whole block using a precise regex
# Wait, let's just find `function MobileLayout` and replace inside it to avoid touching other things.

start_idx = content.find("function MobileLayout(")
end_idx = content.find("function TabletLayout(", start_idx)
mobile_content = content[start_idx:end_idx]

# Pattern to replace in mobile_content:
pattern = r'<div className="flex flex-col items-end">\s*<p className="font-medium text-\[#182033\] text-\[12px\] whitespace-nowrap text-right">.*?</div>\s*</button>\s*</div>\s*</div>'

# Let's use a more flexible replacement logic.
# I'll just find the exact block and replace it manually.
# `dY"?` in my terminal might be an emoji corruption of 📍. Let's look for `<div className="flex flex-col items-end">` and `</button>` in MobileLayout.

def replace_mobile():
    idx = mobile_content.find('<div className="flex flex-col items-end">')
    if idx == -1: return mobile_content
    # find the matching closing div for this block, or just the end of the button
    btn_end = mobile_content.find('</button>', idx)
    if btn_end == -1: return mobile_content
    # The actual end is two `</div>` after `</button>`.
    # Let's grab the raw string to be safe.
    end_of_block = mobile_content.find('</div>', btn_end)
    end_of_block = mobile_content.find('</div>', end_of_block + 6) + 6
    
    old_block = mobile_content[idx:end_of_block]
    
    # We want to reconstruct it beautifully.
    # The button is: <button onClick={() => setDarkMode(!darkMode)} ... </button>
    btn_start = old_block.find('<button onClick={() => setDarkMode(!darkMode)}')
    btn_block = old_block[btn_start:old_block.find('</button>', btn_start) + 9]
    
    # The location is: <p ...> 📍 {WEATHER.location} </p>
    p_start = old_block.find('<p className="font-medium')
    p_end = old_block.find('</p>', p_start) + 4
    p_block = old_block[p_start:p_end]
    
    # The date is: <div className="bg-[#f4f6fa] ..."> ... </div>
    date_start = old_block.find('<div className="bg-[#f4f6fa]')
    date_end = old_block.find('</div>', date_start) + 6
    # Wait, the inner p tag also has </div> closing? No, <p>...</p></div>
    p2_end = old_block.find('</p>', date_start)
    date_end = old_block.find('</div>', p2_end) + 6
    date_block = old_block[date_start:date_end]
    
    # Need to add `mt-1` to date_block if it doesn't have it
    if "mt-1" not in date_block:
        date_block = date_block.replace('className="bg-[#f4f6fa] ', 'className="bg-[#f4f6fa] mt-1 ')
    
    new_block = f"""<div className="flex items-center">
          <div className="flex flex-col items-end">
            {p_block}
            {date_block}
          </div>
          {btn_block}
        </div>"""
    
    return mobile_content[:idx] + new_block + mobile_content[end_of_block:]

new_mobile = replace_mobile()

content = content[:start_idx] + new_mobile + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced MobileLayout header grouping")