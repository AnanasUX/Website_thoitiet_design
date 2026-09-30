import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fixing DesktopLayout news grid
old_grid = """            {/* News grid */}
            <div className="flex flex-wrap gap-3 items-start w-full">
              {grid.map((item, i) => (
                <a
                  key={i}
                  href={item.link ?? "#"}
                  target={item.link ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-[calc(50%-6px)] no-underline group"
                >"""
new_grid = """            {/* News grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
              {grid.map((item, i) => (
                <a
                  key={i}
                  href={item.link ?? "#"}
                  target={item.link ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="bg-white flex flex-col items-start overflow-hidden rounded-2xl shadow-[0px_4px_12px_0px_rgba(23,33,51,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(23,33,51,0.2)] transition-all duration-300 w-full no-underline group"
                >"""

content = content.replace(old_grid, new_grid)

# Fixing DesktopLayout typography classes
# In DesktopLayout, replace text-[14px], text-[12px] with text-body, text-caption, text-h3, etc. 
# But wait, we can just replace text-[xxx] within the news card to use standard classes
# like: text-[length:var(--font-h3)] or just var(--font-h3).
# Wait, I defined --text-body in index.css for tailwind v4, so we can use `text-body`, `text-h3`, etc.
# But I am not 100% sure the @theme config is picked up by Vite without restart.
# To be safe, I'll use inline standard Tailwind classes (text-base, text-lg) or just text-[length:var(--font-body)]

old_featured_title = """<p className="font-['Inter:Regular'] font-normal leading-[21px] text-[#182033] text-[14px] w-full line-clamp-3">"""
new_featured_title = """<p className="font-['Inter:Bold'] font-bold text-[#182033] text-[length:var(--font-h3)] w-full line-clamp-3 mb-2">"""
content = content.replace(old_featured_title, new_featured_title)

old_featured_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[13px] line-clamp-2">"""
new_featured_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[length:var(--font-body)] line-clamp-2 mt-3">"""
content = content.replace(old_featured_body, new_featured_body)

old_item_title = """<p className="font-['Inter:Bold'] font-bold leading-5 text-[#182033] text-[14px] w-full line-clamp-2">"""
new_item_title = """<p className="font-['Inter:Bold'] font-bold text-[#182033] text-[length:var(--font-h4)] w-full line-clamp-2 mt-2">"""
content = content.replace(old_item_title, new_item_title)

old_item_body = """<p className="font-['Inter:Regular'] font-normal leading-[18px] text-[#5f687b] text-[12px] w-full line-clamp-2">"""
new_item_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[length:var(--font-caption)] w-full line-clamp-2 mt-1">"""
content = content.replace(old_item_body, new_item_body)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")