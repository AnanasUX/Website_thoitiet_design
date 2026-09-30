import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Current GoldPriceSection return block:
# It starts with: <div className="grid grid-cols-3 gap-2 w-full">
# And the item has: <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[12px] p-2 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">

# Let's replace the whole GoldPriceSection function to be perfect.
new_func = """function GoldPriceSection() {
  const [goldData, setGoldData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'))
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const keys = ['24K', 'NPQ', 'SJC'];
          const filtered = data.data.filter((item: any) => keys.includes(item.productType));
          filtered.sort((a: any, b: any) => keys.indexOf(a.productType) - keys.indexOf(b.productType));
          setGoldData(filtered.length === 3 ? filtered : data.data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!goldData.length) return null;

  return (
    <div className="w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef]">
      <div className="flex items-center gap-2">
        <p className="font-bold text-[#182033] text-[18px]">Giá Vàng Phú Quý</p>
        <div className="bg-[#fff4e5] px-2 py-0.5 rounded-full flex items-center">
          <p className="font-bold text-[10px] text-[#f7a928]">LIVE</p>
        </div>
      </div>
      <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 sm:gap-3 w-full scrollbar-hide pb-1">
        {goldData.map((item, idx) => (
          <div key={idx} className="flex flex-col shrink-0 min-w-[150px] md:min-w-0 border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc] w-full overflow-hidden">
            <p className="font-bold text-[#182033] text-[14px] line-clamp-1 mb-2 leading-tight" title={item.productTypeName}>{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full gap-1">
              <p className="text-[#5f687b] text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[14px] whitespace-nowrap">{item.priceIn.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-1 gap-1">
              <p className="text-[#5f687b] text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[14px] whitespace-nowrap">{item.priceOut.toLocaleString('vi-VN')}</p>
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
print("Updated GoldPriceSection to flex overflow on mobile, grid on md")