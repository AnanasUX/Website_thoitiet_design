import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace warning block
old_warn = """          <div className="flex flex-col gap-1 w-full">
              {warningText.split('\\n').map((line, i) => (
                <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{line}</p>
              ))}
            </div>"""

new_warn = """          <div className="flex flex-col gap-1 w-full">
              {warningText.split('\\n').map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                const text = line.replace(/^[└├]\\s*/, '');
                return <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
              })}
            </div>"""
content = content.replace(old_warn, new_warn)

# Replace suggestion block
old_sugg = """          <div className="flex flex-col gap-0 w-full">
            {suggestionItems.map((line, i) => (
              <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b]">{line}</p>
            ))}
          </div>"""

new_sugg = """          <div className="flex flex-col gap-0 w-full">
            {suggestionItems.map((line, i, arr) => {
                const prefix = arr.length > 1 ? (i === arr.length - 1 ? '└ ' : '├ ') : '└ ';
                const text = line.replace(/^[└├]\\s*/, '').replace(/^[-•]\\s*/, '');
                return <p key={i} className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] w-full">{prefix}{text}</p>;
            })}
          </div>"""
content = content.replace(old_sugg, new_sugg)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")