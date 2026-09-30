import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the MarketSection SVG block
old_svg = """<svg viewBox="0 0 300 65" className="w-full h-[65px] overflow-visible preserve-3d" preserveAspectRatio="none">
             {/* Forecast line (dashed) */}
             <path d={pathForecast} fill="none" stroke="#e3e7ef" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
             {/* Real line (solid green) */}
             <path d={pathReal} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
             
             {/* Invisible hover overlay to catch pointer events */}
             {rawForecast.map((v, i) => (
               <rect key={i} x={(i / (rawForecast.length - 1)) * 300 - 6} y="0" width="12" height="65" fill="transparent"
                     onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
             ))}
             
             {/* Real points */}
             {rawReal.map((v, i) => (
               <circle key={`real-${i}`} cx={(i / (rawForecast.length - 1)) * 300} cy={60 - ((v - axisMin) / r) * 55} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" className="pointer-events-none" />
             ))}
          </svg>"""

new_svg = """<div className="relative w-full h-[65px]">
          <svg viewBox="0 0 300 65" className="absolute top-0 left-0 w-full h-[65px] overflow-visible preserve-3d" preserveAspectRatio="none">
             {/* Forecast line (dashed) */}
             <path d={pathForecast} fill="none" stroke="#e3e7ef" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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

# Safely replace using regex because of whitespace
content = re.sub(r'<svg viewBox="0 0 300 65" className="w-full h-\[65px\] overflow-visible preserve-3d" preserveAspectRatio="none">.*?</svg>', new_svg, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated SVG layout.")