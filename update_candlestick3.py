import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_hover = """{/* Invisible hover area extending full height */}
                  <div className="absolute w-[16px] h-[65px] -top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20"></div>"""

new_hover = ""

content = content.replace(old_hover, new_hover)

# also remove onMouseEnter from the candle div
content = content.replace('onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>', '>')

# add the full height hover panels BEFORE the candlesticks (so they don't block tooltip if we wanted, wait, they SHOULD be after candlesticks to capture hover!)

hover_panels = """
          {/* Full height hover capture zones */}
          <div className="absolute inset-0 flex w-full h-full z-20">
            {rawForecast.map((_: any, i: number) => (
              <div key={`hover-${i}`} className="absolute top-0 h-full cursor-crosshair"
                   style={{ left: `calc(${(i / (rawForecast.length - 1)) * 100}% - 8px)`, width: '16px' }}
                   onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              </div>
            ))}
          </div>
          </div>"""

content = content.replace('</div>\n          </div>\n        <div className="flex justify-between', hover_panels + '\n        <div className="flex justify-between')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed hover areas.")