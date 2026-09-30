import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace suggestion block again to strip symbols better
old_sugg = """          <div className="flex flex-col gap-0 w-full">
            {suggestionItems.map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                const text = line.replace(/^[└├]\\s*/, '').replace(/^[-•]\\s*/, '');
                return <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
            })}
          </div>"""

new_sugg = """          <div className="flex flex-col gap-1 w-full mt-1">
            {suggestionItems.map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                // Remove any leading bullet points or symbols like ▪, •, -, or corrupted chars
                const text = line.replace(/^[^a-zA-ZÀ-ỹ0-9]+\\s*/, '');
                return <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
            })}
          </div>"""
content = content.replace(old_sugg, new_sugg)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")