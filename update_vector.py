import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace paths in MarketSection to use vectorEffect
content = content.replace(
    'strokeLinecap="round" strokeLinejoin="round" />',
    'strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />'
)

# Wait, the circles. 
# {rawReal.map((v, i) => (
#    <circle key={`real-${i}`} cx={(i / (rawForecast.length - 1)) * 300} cy={60 - ((v - axisMin) / r) * 55} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" className="pointer-events-none" />
# ))}

old_circles = """{/* Real points */}
             {rawReal.map((v, i) => (
               <circle key={`real-${i}`} cx={(i / (rawForecast.length - 1)) * 300} cy={60 - ((v - axisMin) / r) * 55} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" className="pointer-events-none" />
             ))}"""

new_circles = """{/* Real points */}
             {rawReal.map((v, i) => (
               <circle key={`real-${i}`} cx={(i / (rawForecast.length - 1)) * 300} cy={60 - ((v - axisMin) / r) * 55} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="pointer-events-none" />
             ))}"""
             
content = content.replace(old_circles, new_circles)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated vectorEffect.")