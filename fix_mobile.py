with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix Mobile opening!
mobile_old = "      </div>\n          {newsFeed.map((item, i) => ("
mobile_new = "      </div>\n          {isFetchingCategory ? <NewsSkeleton /> : (<>\n          {newsFeed.map((item, i) => ("
content = content.replace(mobile_old, mobile_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed Mobile opening")