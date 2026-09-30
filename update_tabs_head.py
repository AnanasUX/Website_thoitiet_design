import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "function MarketSection() {",
    "function MarketSection() {\n  const [activeMarketTab, setActiveMarketTab] = React.useState<'gold' | 'fx' | 'petrol'>('gold');"
)

# And inject the tabs menu:
wrapper = """<div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">"""

tabs_menu = """<div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
        
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-1">
          <button onClick={() => setActiveMarketTab('gold')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'gold' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Giá Vàng</button>
          <button onClick={() => setActiveMarketTab('fx')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'fx' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Ngoại Tệ</button>
          <button onClick={() => setActiveMarketTab('petrol')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'petrol' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Xăng Dầu</button>
        </div>
        
        <div className={activeMarketTab === 'gold' ? 'block' : 'hidden'}>"""

content = content.replace(wrapper + "\n        <div className=\"flex items-center justify-between w-full mb-1\">", tabs_menu + "\n        <div className=\"flex items-center justify-between w-full mb-1\">")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected state and tabs menu")