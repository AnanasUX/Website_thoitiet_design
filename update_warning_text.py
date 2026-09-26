import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

s_old = """<p className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{warningText}</p>"""
s_new = """<div className="flex flex-col gap-1 w-full">
              {warningText.split('\\n').map((line, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{line}</p>
              ))}
            </div>"""

content = content.replace(s_old, s_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated warningText rendering")