import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace DesktopLayout News Grid using regex
pattern = r'\{\/\* News grid \*\/\}\s*<div className="flex flex-wrap gap-3 items-start w-full">\s*\{grid\.map\(\(item, i\) => \(\s*<a\s*key=\{i\}\s*href=\{item\.link \?\? "\#"\}\s*target=\{item\.link \? "_blank" : undefined\}\s*rel="noopener noreferrer"\s*className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-\[0px_4px_12px_0px_rgba\(23,33,51,0\.1\)\] hover:-translate-y-1 hover:shadow-\[0_8px_20px_rgba\(23,33,51,0\.2\)\] transition-all duration-300 w-\[calc\(50\%-6px\)\] no-underline group"\s*>'
replacement = """{/* News grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
              {grid.map((item, i) => (
                <a
                  key={i}
                  href={item.link ?? "#"}
                  target={item.link ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group"
                >"""
if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    print("Matched and replaced Desktop grid")
else:
    print("Desktop grid pattern not found!")

# Now Tablet Layout list (it doesn't have a grid currently, it's a list with horizontal flex)
# Should we leave Tablet as a vertical list or convert it to grid? 
# "Hiện tại phần bài viết hiển thị khác xấu trên website với sử dụng PC có thể thay đổi thay vì hiển thị 2 bài viết thì có thể hiện thị 3 bài viết trên hàng" -> "PC only". Tablet is fine.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
