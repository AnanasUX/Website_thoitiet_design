with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """        <a href={article.link} target="_blank" rel="noopener noreferrer" className="mt-4 bg-[#f4f6fa] hover:bg-[#e3e7ef] text-[#182033] font-bold text-center py-3 rounded-xl transition-colors">
          Đọc bài viết gốc trên {article.src.split(' ')[0]}
        </a>"""

if target in content:
    content = content.replace(target, "")
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Removed origin link button.")
else:
    print("Could not find the target link button to remove.")