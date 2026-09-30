import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

end_replace = """        </div>
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
    );"""

# Replace the specific block
idx = content.rfind("        </div>\n      </div>\n    </div>\n  );")
if idx != -1:
    content = content[:idx] + end_replace + content[idx + len("        </div>\n      </div>\n    </div>\n  );"):]
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Injected tab bodies successfully")
else:
    print("Could not find the end block")