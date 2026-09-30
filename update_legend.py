import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Change stroke color
content = content.replace('stroke="#e3e7ef"', 'stroke="#94a3b8"')

# Old chart section:
old_chart = """      {/* Chart */}
      <div className="w-full mt-4 bg-[#f8fafc] border border-[#e3e7ef] rounded-[12px] p-2 relative h-[90px] overflow-hidden">
        {/* Tooltip on hover */}
        {hoverIdx !== null && hoverIdx < rawForecast.length && (
          <div className="absolute z-10 bg-[#182033] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
               style={{ 
                 left: `calc(0.5rem + (100% - 1rem) * ${hoverIdx / (rawForecast.length - 1)})`,
                 top: hoverIdx < rawReal.length ? `calc(0.5rem + ${ptsReal[hoverIdx].y}px)` : `calc(0.5rem + ${ptsForecast[hoverIdx].y}px)`
               }}>
            {`${hoverIdx}:00 - ${((hoverIdx < rawReal.length ? rawReal[hoverIdx] : rawForecast[hoverIdx])/1000000).toFixed(2)} Tr`}
          </div>
        )}
        
        <div className="relative w-full h-[65px]">"""

new_chart = """      {/* Chart */}
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
"""

if old_chart in content:
    content = content.replace(old_chart, new_chart)
    print("Replaced chart layout successfully.")
else:
    print("Could not find old_chart block.")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)