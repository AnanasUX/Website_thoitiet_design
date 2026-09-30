import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_func = """function GoldPriceSection() {
  const [goldData, setGoldData] = useState<any[]>([
    { productTypeName: 'Vàng trang sức 999.9', priceIn: 13500000, priceOut: 14000000 },
    { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 13800000, priceOut: 14100000 },
    { productTypeName: 'Vàng miếng SJC', priceIn: 13800000, priceOut: 14100000 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'))
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const keys = ['24K', 'NPQ', 'SJC'];
          const filtered = data.data.filter((item: any) => keys.includes(item.productType));
          if (filtered.length >= 3) {
            filtered.sort((a: any, b: any) => keys.indexOf(a.productType) - keys.indexOf(b.productType));
            setGoldData(filtered.slice(0, 3));
          }
        }
      })
      .catch(() => console.error("Gold API failed, using fallback"));
  }, []);

  if (!goldData.length) return null;

  return (
    <div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
      <div className="flex items-center gap-2">
        <p className="font-bold text-[#182033] text-[18px]">Giá Vàng Phú Quý</p>
        <div className="bg-[#fff4e5] px-2 py-0.5 rounded-full flex items-center">
          <p className="font-bold text-[10px] text-[#f7a928]">LIVE</p>
        </div>
      </div>
      
      {/* MOBILE LAYOUT (Horizontal Scroll) */}
      <div className="flex md:hidden overflow-x-auto gap-3 scrollbar-hide pb-1 w-full">
        {goldData.map((item, idx) => (
          <div key={idx} className="flex flex-col shrink-0 min-w-[150px] border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc]">
            <p className="font-bold text-[#182033] text-[14px] line-clamp-1 mb-2">{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#5f687b] text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-1">
              <p className="text-[#5f687b] text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PC / TABLET LAYOUT (Grid 3 Columns) */}
      <div className="hidden md:grid grid-cols-3 gap-2 w-full">
        {goldData.map((item, idx) => (
          <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[12px] p-2 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
            <p className="font-bold text-[#182033] text-[12px] sm:text-[14px] line-clamp-1 sm:line-clamp-2 mb-2 leading-tight" title={item.productTypeName}>{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[11px] sm:text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-1 gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[11px] sm:text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}"""

content = re.sub(r'function GoldPriceSection\(\).*?return \(\s*<div className="w-full flex flex-col gap-3 mb-6 bg-white.*?</div>\s*\);\s*\}', new_func, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated GoldPriceSection to have static fallback and exact requested HTMLs")