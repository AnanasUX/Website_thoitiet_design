import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """const forecast = new Array(25).fill(0);
    for (let i=0; i<=currentHour; i++) {
       forecast[i] = real[i];
    }"""

new_logic = """const forecast = new Array(25).fill(0);
    for (let i=0; i<=currentHour; i++) {
       forecast[i] = Math.round((real[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
    }"""

# Safely replace using regex because of whitespace
content = re.sub(r'const forecast = new Array\(25\)\.fill\(0\);\s*for \(let i=0; i<=currentHour; i\+\+\) \{\s*forecast\[i\] = real\[i\];\s*\}', new_logic, content, flags=re.DOTALL)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Restored original forecast wave logic.")