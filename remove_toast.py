import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

toast_html = """      {apiStatus === "ok" && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-green-600/80 text-white text-[12px] px-4 py-1 rounded-full backdrop-blur-sm animate-fade-out">
          ✅ Dữ liệu thực tế đã cập nhật
        </div>
      )}"""

content = content.replace(toast_html, "")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed toast")
