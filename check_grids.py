import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find all news grids and check their parent div class
matches = list(re.finditer(r'Tin Tức Mới Nhất.*?</div>.*?{newsFeed\.map', content, re.DOTALL))
for m in matches:
    # Get the parent div of the {newsFeed.map
    start = m.start()
    parent_start = content.rfind('<div', 0, start)
    print("--------------------------------")
    print(content[parent_start:start+100])
