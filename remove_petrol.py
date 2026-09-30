with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the petrol tab button
petrol_btn = """          <button onClick={() => setActiveMarketTab('petrol')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'petrol' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Xăng Dầu</button>\n"""

# Encoding issues might prevent direct match, let's find the substring
idx_fx = content.find("setActiveMarketTab('fx')")
idx_petrol = content.find("setActiveMarketTab('petrol')")
if idx_petrol != -1:
    end_petrol_btn = content.find("</button>", idx_petrol) + 9
    # Also find the start
    start_petrol_btn = content.rfind("<button", 0, idx_petrol)
    content = content[:start_petrol_btn] + content[end_petrol_btn:]

# 2. Remove the activeMarketTab === 'petrol' section
idx_petrol_sec = content.find("activeMarketTab === 'petrol'")
if idx_petrol_sec != -1:
    start_sec = content.rfind("{", 0, idx_petrol_sec)
    # The section ends with `</div>\n        )}`
    # Let's find `)}` that matches this.
    end_sec = content.find(")}", idx_petrol_sec) + 2
    # Wait, there might be nested `{}`. Let's just find `GiA bAn l tham kho vA1ng 1</p>\n          </div>\n        )}`
    end_sec_marker = content.find("</p>\n          </div>\n        )}", idx_petrol_sec)
    if end_sec_marker != -1:
        content = content[:start_sec] + content[end_sec_marker + 33:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed petrol section.")