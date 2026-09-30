import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will find the EXACT string:
search_str = """            <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
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
      </div>
    </div>
  
        {activeMarketTab === 'fx' && ("""

# Replace it with the correct closing tags.
# In the original, the gold tab is wrapped in:
# <div className={activeMarketTab === 'gold' ? 'block' : 'hidden'}>
# Then inside it, the header, the grid, the chart.
# So I need to close the chart, close the gold tab wrapper. That's it.
# Then fx tab, petrol tab, then close the main wrapper.

correct_end = """            <div className="flex justify-between text-[8px] sm:text-[9px] text-[#5f687b] mt-1 font-medium px-[2px]">
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
      </div>

        {activeMarketTab === 'fx' && ("""

content = content.replace(search_str, correct_end)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed JSX nesting")