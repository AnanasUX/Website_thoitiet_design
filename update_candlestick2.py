import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace variables axisMin and axisMax
old_axes = """  const axisMin = hasChart ? Math.min(...chartData.real, ...chartData.forecast) * 0.999 : 0;
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
  const pathForecast = ptsForecast.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");"""

new_axes = """  // Map over OHLC data
  const allRealL = hasChart ? rawReal.map((d: any) => d.l) : [];
  const allRealH = hasChart ? rawReal.map((d: any) => d.h) : [];
  const allFcL = hasChart ? rawForecast.map((d: any) => d.l) : [];
  const allFcH = hasChart ? rawForecast.map((d: any) => d.h) : [];
  const axisMin = hasChart ? Math.min(...allRealL, ...allFcL) * 0.999 : 0;
  const axisMax = hasChart ? Math.max(...allRealH, ...allFcH) * 1.001 : 1;
  const r = axisMax - axisMin || 1;"""

content = content.replace(old_axes, new_axes)

old_chart = """      {/* Chart */}
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-[12px] p-2 relative flex flex-col gap-2 overflow-hidden">
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-3 px-1 w-full">
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-0.5 bg-[#16a34a]"></div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Thực tế</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-[1px] border-t-2 border-dashed border-[#94a3b8]"></div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Dự kiến</span>
          </div>
        </div>

        <div className="relative w-full h-[65px]">
          {/* Tooltip on hover */}
          {hoverIdx !== null && hoverIdx < rawForecast.length && (
            <div className="absolute z-10 bg-[#182033] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
                 style={{ 
                   left: `${(hoverIdx / (rawForecast.length - 1)) * 100}%`,
                   top: hoverIdx < rawReal.length ? `${ptsReal[hoverIdx].y}px` : `${ptsForecast[hoverIdx].y}px`
                 }}>
              {`${hoverIdx}:00 - ${((hoverIdx < rawReal.length ? rawReal[hoverIdx] : rawForecast[hoverIdx])/1000000).toFixed(2)} Tr`}
            </div>
          )}

          <svg viewBox="0 0 300 65" className="absolute top-0 left-0 w-full h-[65px] overflow-visible preserve-3d" preserveAspectRatio="none">
             {/* Forecast line (dashed) */}
             <path d={pathForecast} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
             {/* Real line (solid green) */}
             <path d={pathReal} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
             
             {/* Invisible hover overlay to catch pointer events */}
             {rawForecast.map((v, i) => (
               <rect key={i} x={(i / (rawForecast.length - 1)) * 300 - 6} y="0" width="12" height="65" fill="transparent"
                     onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
             ))}
          </svg>
          {/* Real points drawn as absolute divs to avoid ellipse distortion */}
          {rawReal.map((v, i) => (
            <div key={`real-point-${i}`} className="absolute rounded-full bg-white pointer-events-none" 
                 style={{ 
                   left: `calc(${(i / (rawForecast.length - 1)) * 100}% - 2.5px)`, 
                   top: `calc(${60 - ((v - axisMin) / r) * 55}px - 2.5px)`,
                   width: '5px', height: '5px', border: '1.5px solid #16a34a'
                 }}></div>
          ))}
          </div>"""

new_chart = """      {/* Chart */}
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-[12px] p-2 relative flex flex-col gap-2 overflow-hidden">
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-3 px-1 w-full">
          <div className="flex items-center gap-1.5">
             <div className="flex gap-[2px]">
               <div className="w-1.5 h-2.5 bg-[#16a34a] rounded-[1px]"></div>
               <div className="w-1.5 h-2.5 bg-[#ef4444] rounded-[1px]"></div>
             </div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Thực tế</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-2.5 bg-[#94a3b8] rounded-[1px]"></div>
             <span className="text-[9px] text-[#5f687b] font-bold uppercase tracking-wider">Dự kiến</span>
          </div>
        </div>

        <div className="relative w-full h-[65px]">
          {/* Tooltip on hover */}
          {hoverIdx !== null && hoverIdx < rawForecast.length && (
            <div className="absolute z-50 bg-[#182033] text-white text-[10px] px-2.5 py-2 rounded-md whitespace-nowrap shadow-[0px_4px_12px_rgba(0,0,0,0.3)] pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+6px)]"
                 style={{ left: `${(hoverIdx / (rawForecast.length - 1)) * 100}%`, top: `0px` }}>
              <p className="font-bold border-b border-[#334155] pb-1 mb-1.5 text-center">{hoverIdx}:00</p>
              <div className="flex flex-col gap-1">
                {hoverIdx < rawReal.length && (
                  <div className="flex justify-between gap-4 text-[#10b981]">
                    <span>Thực tế:</span>
                    <span className="font-bold">{(rawReal[hoverIdx].c/1000000).toFixed(2)} Tr</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-[#cbd5e1]">
                  <span>Dự kiến:</span>
                  <span className="font-bold">{(rawForecast[hoverIdx].c/1000000).toFixed(2)} Tr</span>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#182033]"></div>
            </div>
          )}

          {/* Candlesticks drawn as absolute divs */}
          <div className="absolute inset-0 flex items-center justify-between w-full h-full">
          {rawForecast.map((fcData: any, i: number) => {
            const isReal = i < rawReal.length;
            const data = isReal ? rawReal[i] : fcData;
            const isUp = data.c >= data.o;
            
            const yHigh = 60 - ((data.h - axisMin) / r) * 55;
            const yLow = 60 - ((data.l - axisMin) / r) * 55;
            const yOpen = 60 - ((data.o - axisMin) / r) * 55;
            const yClose = 60 - ((data.c - axisMin) / r) * 55;
            
            const topY = Math.min(yOpen, yClose);
            const bottomY = Math.max(yOpen, yClose);
            const bodyHeight = Math.max(1.5, bottomY - topY);
            const wickHeight = Math.max(1, yLow - yHigh);

            const color = isReal 
                ? (isUp ? '#16a34a' : '#ef4444') 
                : '#94a3b8'; // gray for forecast
                
            return (
              <div key={`candle-${i}`} className="absolute flex flex-col items-center group cursor-crosshair" 
                   style={{ left: `calc(${(i / (rawForecast.length - 1)) * 100}% - 4px)`, width: '8px', top: `${yHigh}px`, height: `${wickHeight}px` }}
                   onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                  
                  {/* Invisible hover area extending full height */}
                  <div className="absolute w-[16px] h-[65px] -top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20"></div>

                  {/* Wick */}
                  <div className="absolute w-[1.5px] h-full left-1/2 -translate-x-1/2 rounded-full" style={{ backgroundColor: color }}></div>
                  {/* Body */}
                  <div className="absolute w-[4px] rounded-[1px] left-1/2 -translate-x-1/2 transition-transform duration-200 group-hover:scale-125" style={{ top: `${topY - yHigh}px`, height: `${bodyHeight}px`, backgroundColor: color }}></div>
              </div>
            );
          })}
          </div>
          </div>"""

# Safely replace using regex because of whitespace
content = re.sub(r'\{\/\* Chart \*\/}.*?</div>\s*<div className="flex justify-between', new_chart + '\n        <div className="flex justify-between', content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated chart to Candlesticks.")