import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_style = """        <div
          className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"
          style={{ background: baseTheme.gradient }}
        >"""

new_style = """        <div
          className="flex flex-col gap-4 items-start overflow-hidden p-6 rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] w-full"
          style={{ background: "linear-gradient(21deg, rgb(72 141 203) 0%, rgb(51 106 214) 50%, rgb(79 196 255) 100%)" }}
        >"""

content = content.replace(old_style, new_style)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")