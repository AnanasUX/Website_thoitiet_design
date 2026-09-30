with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace <img ...> with <img referrerPolicy="no-referrer" ...>
# There are multiple img tags. Let's just do a string replacement for `src={item.img}` and `src={featured.img}`
content = content.replace('src={item.img}', 'referrerPolicy="no-referrer" src={item.img}')
content = content.replace('src={featured.img}', 'referrerPolicy="no-referrer" src={featured.img}')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")