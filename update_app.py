import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Hide dev button
content = re.sub(r'<button[^>]*aria-label="dev"[^>]*>.*?</button>', '', content, flags=re.DOTALL)

# 2. Change pulse. to Anx.
content = content.replace('pulse.', 'Anx.')

# 3. Strip PM2.5 emoji (remove ${icon} from pm25 interpolation)
content = content.replace('pm25:           `${pm25Val} \u00B5g/m\u00B3 ${icon}`,', 'pm25:           `${pm25Val} \u00B5g/m\u00B3`,')
content = content.replace('pm25:           `${pm25Val} A\u00B5g/mA3 ${icon}`,', 'pm25:           `${pm25Val} \u00B5g/m\u00B3`,')

# It's encoded in utf-8, maybe it is:
content = re.sub(r'pm25:\s*`\$\{pm25Val\} [^`]*\$\{icon\}`', 'pm25: `${pm25Val} \u00B5g/m\u00B3`', content)

# 4. Shuffle newsArr and pick 10
s_old = """const mapped: LiveNewsItem[] = newsArr.slice(0, 10).map((item, i) => ({"""
s_new = """const shuffledNews = [...newsArr].sort(() => Math.random() - 0.5);
          const mapped: LiveNewsItem[] = shuffledNews.slice(0, 10).map((item, i) => ({"""
content = content.replace(s_old, s_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")