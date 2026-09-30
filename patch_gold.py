import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add GoldPrice widget
gold_price_code = """
function GoldPriceSection() {
  const [goldData, setGoldData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'))
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          // Filter some key products like SJC, NPQ, 24K
          const keys = ['SJC', 'NPQ', '24K', '9999'];
          const filtered = data.data.filter((item: any) => keys.includes(item.productType));
          setGoldData(filtered.length ? filtered : data.data.slice(0, 4));
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
      <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-1">
        {goldData.map((item, idx) => (
          <div key={idx} className="flex flex-col shrink-0 min-w-[150px] border border-[#e3e7ef] rounded-[12px] p-3 bg-[#f8fafc]">
            <p className="font-bold text-[#182033] text-[14px] line-clamp-1 mb-2">{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full">
              <p className="text-[#5f687b] text-[12px]">Mua</p>
              <p className="font-semibold text-[#16a34a] text-[14px]">{(item.priceIn / 1000).toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-1">
              <p className="text-[#5f687b] text-[12px]">Bán</p>
              <p className="font-semibold text-[#ef4444] text-[14px]">{(item.priceOut / 1000).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

if "function GoldPriceSection" not in content:
    content = content.replace("export default function App", gold_price_code + "\nexport default function App")

# Now inject <GoldPriceSection /> before Tin Tức Mới Nhất in DesktopLayout, TabletLayout, and MobileLayout
# 1. DesktopLayout
desktop_target = """<div className="flex items-center justify-between w-full mb-1 sticky top-[var(--header-height)] bg-[#f4f6fa] z-[90] py-3 mt-[-12px]">"""
if "<GoldPriceSection />" not in content and desktop_target in content:
    content = content.replace(desktop_target, "<GoldPriceSection />\n      " + desktop_target)

# 2. TabletLayout
tablet_target = """<div className="flex flex-col gap-[2px] items-start">
            <p className="font-bold text-[#182033] text-[20px] tracking-[-0.3px]">Tin tức</p>"""
if tablet_target in content:
    content = content.replace(tablet_target, "<GoldPriceSection />\n          " + tablet_target)

# 3. MobileLayout
mobile_target = """<div className="flex flex-col gap-[2px] items-start w-full">
          <p className="font-bold text-[#182033] text-[20px] tracking-[-0.3px]">Tin tức</p>"""
if mobile_target in content:
    content = content.replace(mobile_target, "<GoldPriceSection />\n          " + mobile_target)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected GoldPriceSection")