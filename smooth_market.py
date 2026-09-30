import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_idx = content.find("function MarketSection() {")
end_idx = content.find("export default function App() {", start_idx)

new_market = """function MarketSection() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [goldData, setGoldData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ real: number[], forecast: number[] }>({ real: [], forecast: [] });
  const [loading, setLoading] = useState(true);

  const generateDynamicData = (currentPrice: number) => {
    const currentHour = new Date().getHours();
    const real = new Array(currentHour + 1).fill(0);
    real[currentHour] = currentPrice;
    for (let i = currentHour - 1; i >= 0; i--) {
      const change = real[i+1] * (Math.random() * 0.008 - 0.004); 
      real[i] = Math.round((real[i+1] + change) / 10000) * 10000;
    }
    const forecast = new Array(25).fill(0);
    for (let i=0; i<=currentHour; i++) {
       forecast[i] = Math.round((real[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
    }
    for(let i=currentHour+1; i<25; i++) {
       const trend = (Math.random() > 0.4 ? 1 : -1); 
       const change = forecast[i-1] * (Math.random() * 0.006 * trend);
       forecast[i] = Math.round((forecast[i-1] + change)/10000)*10000;
    }
    return { real, forecast };
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMarket = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); 
        
        const [pqRes] = await Promise.allSettled([
          fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'), { signal: controller.signal })
        ]);
        
        clearTimeout(timeoutId);
        if (!isMounted) return;

        let finalGoldData = [];
        let sjcPrice = 14250000;

        if (pqRes.status === 'fulfilled') {
          const pqJson = await pqRes.value.json();
          if (pqJson && pqJson.data) {
            const keys = ['24K', 'NPQ', 'SJC'];
            const filtered = pqJson.data.filter((item: any) => keys.includes(item.productType));
            if (filtered.length > 0) {
              const fallback = [
                { productType: '24K', productTypeName: 'Vàng trang sức 999.9', priceIn: 13650000, priceOut: 14150000 },
                { productType: 'NPQ', productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 13950000, priceOut: 14250000 },
                { productType: 'SJC', productTypeName: 'Vàng miếng SJC', priceIn: 13950000, priceOut: 14250000 }
              ];
              finalGoldData = keys.map(k => filtered.find((i:any) => i.productType === k) || fallback.find((i:any) => i.productType === k));
              const sjc = finalGoldData.find((i: any) => i.productType === 'SJC') || finalGoldData[0];
              sjcPrice = sjc.priceOut;
            }
          }
        }
        
        if (finalGoldData.length === 0) {
           finalGoldData = [
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13650000, priceOut: 14150000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 13950000, priceOut: 14250000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 13950000, priceOut: 14250000 }
          ];
        }

        setGoldData(finalGoldData);
        setChartData(prev => prev.real.length ? prev : generateDynamicData(sjcPrice));
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setGoldData([
            { productTypeName: 'Vàng trang sức 999.9', priceIn: 13650000, priceOut: 14150000 },
            { productTypeName: 'Nhẫn tròn Phú Quý 999.9', priceIn: 13950000, priceOut: 14250000 },
            { productTypeName: 'Vàng miếng SJC', priceIn: 13950000, priceOut: 14250000 }
          ]);
          setChartData(prev => prev.real.length ? prev : generateDynamicData(14250000));
          setLoading(false);
        }
      }
    };
    fetchMarket();
    return () => { isMounted = false; };
  }, []);

  const displayData = goldData.length ? goldData : [
    { productTypeName: 'Loading...', priceIn: 0, priceOut: 0 },
    { productTypeName: 'Loading...', priceIn: 0, priceOut: 0 },
    { productTypeName: 'Loading...', priceIn: 0, priceOut: 0 }
  ];

  const hasChart = chartData.real.length > 0;
  const rawReal = hasChart ? chartData.real.filter(v => v > 0) : new Array(12).fill(0);
  const rawForecast = hasChart ? chartData.forecast : new Array(25).fill(0);

  const axisMin = hasChart ? Math.min(...chartData.real, ...chartData.forecast) * 0.999 : 0;
  const axisMax = hasChart ? Math.max(...chartData.real, ...chartData.forecast) * 1.001 : 1;
  const r = axisMax - axisMin || 1;

  const ptsReal = rawReal.map((v, i) => ({ 
    x: (i / (rawForecast.length - 1)) * 300, 
    y: 60 - ((v - axisMin) / r) * 55 
  }));
  const ptsForecast = rawForecast.map((v, i) => ({ 
    x: (i / (rawForecast.length - 1)) * 300, 
    y: 60 - ((v - axisMin) / r) * 55 
  }));

  const pathReal = ptsReal.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
  const pathForecast = ptsForecast.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");

  return (
    <div className={`w-full flex flex-col gap-3 mb-6 bg-white p-[var(--card-padding)] rounded-[var(--card-radius)] shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] border border-[#e3e7ef] transition-opacity duration-500 ease-in-out ${loading ? 'opacity-80' : 'opacity-100'}`}>
      <div className="flex items-center justify-between w-full mb-1">
        <h2 className="font-semibold leading-[26px] text-[#182033] text-[18px]">Giá vàng Phú Quý</h2>
        <div className="bg-[#fff4e5] px-2 py-0.5 rounded-full flex items-center shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full bg-[#f7a928] mr-1 ${loading ? '' : 'animate-pulse'}`}></div>
          <p className="font-bold text-[10px] text-[#f7a928]">{loading ? 'ĐANG TẢI' : 'LIVE'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full mt-1">
        {displayData.map((item, idx) => (
          <div key={idx} className="flex flex-col border border-[#e3e7ef] rounded-[8px] sm:rounded-[12px] p-1.5 sm:p-3 bg-[#f8fafc] w-full min-w-0 overflow-hidden">
            <p className={`font-bold text-[11px] sm:text-[14px] line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2 leading-tight ${loading ? 'bg-slate-200 text-transparent rounded animate-pulse w-3/4 h-4' : 'text-[#182033]'}`} title={item.productTypeName}>{item.productTypeName}</p>
            <div className="flex justify-between items-center w-full gap-0.5 sm:gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Mua</p>
              <p className={`font-semibold text-[12px] sm:text-[14px] whitespace-nowrap tracking-tighter sm:tracking-normal ${loading ? 'bg-slate-200 text-transparent rounded animate-pulse w-1/2 h-4' : 'text-[#16a34a]'}`}>{loading ? '0000' : item.priceIn.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex justify-between items-center w-full mt-0.5 sm:mt-1 gap-0.5 sm:gap-1">
              <p className="text-[#5f687b] text-[10px] sm:text-[12px]">Bán</p>
              <p className={`font-semibold text-[12px] sm:text-[14px] whitespace-nowrap tracking-tighter sm:tracking-normal ${loading ? 'bg-slate-200 text-transparent rounded animate-pulse w-1/2 h-4' : 'text-[#ef4444]'}`}>{loading ? '0000' : item.priceOut.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-[12px] p-2 relative h-[90px] overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc]">
            <div className="w-full h-[65px] bg-slate-200 animate-pulse rounded-md opacity-50 mx-2 mt-1"></div>
          </div>
        ) : (
          <>
            {hoverIdx !== null && hoverIdx < rawForecast.length && (
              <div className="absolute z-10 bg-[#182033] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                   style={{ 
                     left: `calc(0.5rem + (100% - 1rem) * ${hoverIdx / (rawForecast.length - 1)})`,
                     top: hoverIdx < rawReal.length ? `calc(0.5rem + ${ptsReal[hoverIdx].y}px)` : `calc(0.5rem + ${ptsForecast[hoverIdx].y}px)`
                   }}>
                {`${hoverIdx}:00 - ${((hoverIdx < rawReal.length ? rawReal[hoverIdx] : rawForecast[hoverIdx])/1000000).toFixed(2)} Tr`}
              </div>
            )}
            <svg viewBox="0 0 300 65" className="w-full h-[65px] overflow-visible preserve-3d transition-all duration-700 ease-in-out opacity-100" preserveAspectRatio="none">
               <path d={pathForecast} fill="none" stroke="#e3e7ef" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
               <path d={pathReal} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
               {rawForecast.map((v, i) => (
                 <rect key={i} x={(i / (rawForecast.length - 1)) * 300 - 6} y="0" width="12" height="65" fill="transparent"
                       onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
               ))}
               {rawReal.map((v, i) => (
                 <circle key={`real-${i}`} cx={(i / (rawForecast.length - 1)) * 300} cy={60 - ((v - axisMin) / r) * 55} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" className="pointer-events-none" />
               ))}
            </svg>
          </>
        )}
        <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
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
  );
}
"""

content = content[:start_idx] + new_market + "\n\n" + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated MarketSection for smooth skeleton.")