import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's completely rewrite MarketSection end.
# The `return (` block starts around `return (\n      <div className="w-full flex flex-col gap-3 mb-6 bg-white`
# Let's extract the whole return statement of MarketSection.
match = re.search(r'return \(\s*<div className="w-full flex flex-col gap-3 mb-6 bg-white p-\[var\(--card-padding\)\] rounded-\[var\(--card-radius\)\] shadow-\[0px_4px_12px_0px_rgba\(23,33,51,0\.1\)\] border border-\[#e3e7ef\]">(.*?)\);\s*\}\s*export default function App', content, re.DOTALL)

if match:
    inner = match.group(1)
    # The gold tab content should end at <span>23:59</span></div></div></div></div>
    # Actually, let's just strip everything after <span>23:59</span>
    idx = inner.rfind("<span>23:59</span>")
    
    # After 23:59 span, we have:
    # </div>
    # </div>
    # </div>
    
    # We will just rewrite the entire ending part manually.
    inner = inner[:idx] + """<span>23:59</span>
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
"""
    new_content = content[:match.start()] + 'return (\n      <div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">' + inner + '  );\n}\n\nexport default function App' + content[match.end():]
    
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("MarketSection rewritten successfully")
else:
    print("Regex match failed")