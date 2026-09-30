import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find all instances of "Tin Tức Mới Nhất" or similar with the length.
# In MobileLayout:
# <p className="...">Tin Tức Mới Nhất • {newsFeed.length} bài</p>
content = re.sub(r'Tin Tức Mới Nhất\s*•\s*\{newsFeed\.length\}\s*bài', 'Tin Tức Mới Nhất', content)

# In TabletLayout:
# <p className="...">Tin tức</p>
# <p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[12px]">{WEATHER.location} • {newsFeed.length} bài mới nhất</p>
# The user specifically mentioned `<p ...>Tin Tức Mới Nhất • 30 bài</p>`, so they probably meant the MobileLayout one.
# But let's check if there are others.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success")