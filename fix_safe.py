with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Desktop Layout Header
old_desktop = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
        <div className="flex gap-[var(--grid-gap)] items-center">
          <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
          <div className="flex items-center">
            <div className="bg-[#f4f6fa] flex items-start px-3 py-1 rounded-full">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} A {timeStr}
            </p>
          </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ minHeight: "32px", minWidth: "32px", padding: 0 }} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square">
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          </div>

        </div>

      </div>"""

new_desktop = """<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">
        <div className="flex gap-[var(--grid-gap)] items-center">
          <p className="font-bold text-[#182033] text-[18px] whitespace-nowrap">Anx.</p>
        </div>
        <div className="flex items-center">
          <div className="bg-[#f4f6fa] flex items-center px-3 py-1 rounded-full">
            <p className="font-normal text-[#5f687b] text-[12px] whitespace-nowrap">
              {dateStr} · {timeStr}
            </p>
          </div>
          <div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </div>
        </div>
      </div>"""

# There is a special char in `A` which might not match, let's locate the Desktop Layout via indexing.
idx = content.find("function DesktopLayout(")
start = content.find('<div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0 max-w-[1200px] mx-auto sticky top-0 z-[100]">', idx)
end = content.find('</div>\n\n      </div>', start) + 20

content = content[:start] + new_desktop + content[end:]

# Tablet Layout Fix Button ONLY (layout is already correct)
idx_tablet = content.find("function TabletLayout(")
start_tablet = content.find('<button onClick={() => setDarkMode(!darkMode)}', idx_tablet)
end_tablet = content.find('</button>', start_tablet) + 9
new_btn_tablet = """<div onClick={() => setDarkMode(!darkMode)} role="button" tabIndex={0} className="ml-2 w-[32px] h-[32px] rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0 aspect-square cursor-pointer">
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </div>"""
content = content[:start_tablet] + new_btn_tablet + content[end_tablet:]

# Mobile Layout Fix Button ONLY
idx_mobile = content.find("function MobileLayout(")
start_mobile = content.find('<button onClick={() => setDarkMode(!darkMode)}', idx_mobile)
end_mobile = content.find('</button>', start_mobile) + 9
content = content[:start_mobile] + new_btn_tablet + content[end_mobile:]

# Petrol Names
content = content.replace("Xng RON 95-III", "Xăng E10")
content = content.replace("Xng E5 RON 92-II", "Xăng E5")
content = content.replace("Xăng RON 95-III", "Xăng E10")
content = content.replace("Xăng E5 RON 92-II", "Xăng E5")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Finished rewriting safely.")