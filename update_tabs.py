import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add activeMarketTab state to MarketSection
if "const [activeMarketTab, setActiveMarketTab] = useState<'gold' | 'fx' | 'petrol'>('gold');" not in content:
    content = content.replace(
        "function MarketSection() {",
        "function MarketSection() {\n  const [activeMarketTab, setActiveMarketTab] = useState<'gold' | 'fx' | 'petrol'>('gold');"
    )

# Replace the heading section
header_regex = r'<div className="w-full flex flex-col gap-3 mb-6 bg-white p-\[var\(--card-padding\)\] rounded-\[var\(--card-radius\)\]\s*shadow-\[0px_4px_12px_0px_rgba\(23,33,51,0\.1\)\] border border-\[#e3e7ef\]">\s*<div className="flex items-center justify-between w-full mb-1">\s*<h2 className="font-semibold leading-\[26px\] text-\[#182033\] text-\[18px\]">GiA vAng PhA QuA</h2>'

replacement = """<div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
        
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-1">
          <button onClick={() => setActiveMarketTab('gold')} className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'gold' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Giá Vàng</button>
          <button onClick={() => setActiveMarketTab('fx')} className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'fx' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Ngoại Tệ</button>
          <button onClick={() => setActiveMarketTab('petrol')} className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'petrol' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Xăng Dầu</button>
        </div>
        
        {activeMarketTab === 'gold' && (
          <>
            <div className="flex items-center justify-between w-full mb-1">
              <h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Giá vàng Phú Quý</h2>"""

# Note: due to unicode corruption in PS, I will use regex matching the exact broken string "GiA vAng PhA QuA"
# Wait, I shouldn't rely on broken strings. I'll find `<h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">`
# and the `</div>` before it.

def inject_tabs(match):
    return """<div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
        
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-1">
          <button onClick={() => setActiveMarketTab('gold')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'gold' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Giá Vàng</button>
          <button onClick={() => setActiveMarketTab('fx')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'fx' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Ngoại Tệ</button>
          <button onClick={() => setActiveMarketTab('petrol')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'petrol' ? 'bg-[#182033] text-white dark:bg-white dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Xăng Dầu</button>
        </div>
        
        <div className={activeMarketTab === 'gold' ? 'block' : 'hidden'}>
          <div className="flex items-center justify-between w-full mb-1">
""" + match.group(1)

content = re.sub(
    r'<div className="w-full flex flex-col gap-3 mb-6 bg-white p-\[var\(--card-padding\)\] rounded-\[var\(--card-radius\)\] shadow-\[0px_4px_12px_0px_rgba\(23,33,51,0\.1\)\] border border-\[#e3e7ef\]">\s*<div className="flex items-center justify-between w-full mb-1">\s*(<h2 className="font-semibold leading-\[26px\] text-\[#182033\] text-\[18px\]">.*?</svg>\s*</p>\s*\)\}\s*</div>\s*<div className="flex flex-col p-2.*?</div>\s*</div>\s*</div>)',
    # Wait, I just need to close the div for `gold` and add other tabs at the end of MarketSection.
    # It's much easier to do string replacement for the end of the MarketSection
    lambda x: x.group(0), content
)
# Too complex regex. Let's do simple replaces.