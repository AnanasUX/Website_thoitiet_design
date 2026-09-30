with open("market_old.tsx", "r", encoding="utf-8") as f:
    ms_code = f.read()

# Add activeMarketTab state
ms_code = ms_code.replace("function MarketSection() {", "function MarketSection() {\n  const [activeMarketTab, setActiveMarketTab] = React.useState<'gold' | 'fx' | 'petrol'>('gold');")

# Find the return statement
ret_idx = ms_code.find("  return (\n      <div className=\"w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] \nshadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]\">\n        <div className=\"flex items-center justify-between w-full mb-1\">\n          <h2 className=\"font-semibold leading-[26px] text-[#182033] text-[18px]\">")

# Wait, `market_old.tsx` might have newlines in the string
ret_idx = ms_code.find("<div className=\"flex items-center justify-between w-full mb-1\">")
if ret_idx != -1:
    tabs_html = """
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-1">
          <button onClick={() => setActiveMarketTab('gold')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'gold' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Giá Vàng</button>
          <button onClick={() => setActiveMarketTab('fx')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'fx' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Ngoại Tệ</button>
          <button onClick={() => setActiveMarketTab('petrol')} className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[14px] font-semibold transition-colors whitespace-nowrap ${activeMarketTab === 'petrol' ? 'bg-[#182033] text-white dark:bg-[#f5f5f7] dark:text-black' : 'bg-[#f4f6fa] text-[#5f687b]'}`}>Xăng Dầu</button>
        </div>
        
        <div className={activeMarketTab === 'gold' ? 'block' : 'hidden'}>
"""
    ms_code = ms_code[:ret_idx] + tabs_html + ms_code[ret_idx:]
    
    # Close the gold tab at the end
    ms_code = ms_code.replace("""          <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:59</span>
          </div>
        </div>
      </div>
    </div>
  );
}""", """          <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:59</span>
          </div>
        </div>
      </div>
    </div>
    </div>

        {activeMarketTab === 'fx' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full mb-1">
              <h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Tỷ giá Ngoại tệ (Vietcombank)</h2>
            </div>
            {[
              { code: 'USD', name: 'Đô la Mỹ', buy: '24.450', sell: '24.820' },
              { code: 'EUR', name: 'Euro', buy: '26.850', sell: '27.450' },
              { code: 'JPY', name: 'Yên Nhật', buy: '168.50', sell: '175.20' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc]">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-[#182033] text-[14px]">{item.code} <span className="font-normal text-[12px] text-[#5f687b]">({item.name})</span></p>
                </div>
                <div className="flex justify-between items-center w-full mt-1">
                  <p className="text-[#5f687b] text-[12px]">Mua tiền mặt</p>
                  <p className="font-semibold text-[#16a34a] text-[14px]">{item.buy}</p>
                </div>
                <div className="flex justify-between items-center w-full mt-1">
                  <p className="text-[#5f687b] text-[12px]">Bán ra</p>
                  <p className="font-semibold text-[#ef4444] text-[14px]">{item.sell}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMarketTab === 'petrol' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full mb-1">
              <h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Giá Xăng Dầu (Petrolimex)</h2>
            </div>
            {[
              { name: 'Xăng RON 95-III', price: '21.320' },
              { name: 'Xăng E5 RON 92-II', price: '20.420' },
              { name: 'Dầu DO 0,05S-II', price: '18.770' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc]">
                <p className="font-bold text-[#182033] text-[14px]">{item.name}</p>
                <p className="font-semibold text-[#16a34a] text-[14px]">{item.price} đ/l</p>
              </div>
            ))}
            <p className="text-[11px] text-[#5f687b] mt-1 italic">Giá bán lẻ tham khảo vùng 1</p>
          </div>
        )}
      </div>
  );
}""")

with open("src/App.tsx", "r", encoding="utf-8") as f:
    app_code = f.read()

import re
app_code = re.sub(r'function MarketSection\(\) \{.*?(?=export default function App)', ms_code + "\n\n", app_code, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(app_code)

print("Replaced completely with safe old code")