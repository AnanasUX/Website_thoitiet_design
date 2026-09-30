import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_tablet_rest_title = """<p className="font-['Inter:Semi_Bold'] font-semibold leading-[19px] text-[#182033] text-[13px] line-clamp-2 w-full">{item.author}</p>"""
new_tablet_rest_title = """<p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-2 w-full">{item.author}</p>"""
content = content.replace(old_tablet_rest_title, new_tablet_rest_title)

old_tablet_rest_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[11px] line-clamp-1 w-full">{item.body}</p>"""
new_tablet_rest_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[length:var(--font-caption)] line-clamp-1 w-full mt-1">{item.body}</p>"""
content = content.replace(old_tablet_rest_body, new_tablet_rest_body)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")