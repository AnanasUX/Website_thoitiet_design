import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The headers usually look like this:
# <p className="font-bold text-[#ff315f] text-[20px] whitespace-nowrap">Anx.</p>
# We can just put the toggle button NEXT to Anx. logo if we want, or in the right flex container.
# Let's find:
# <div className="bg-white border-b border-[#e3e7ef] flex h-[var(--header-height)] items-center justify-between px-[var(--page-padding)] w-full shrink-0
# ... ">
# And we can inject the button right before the closing </div> of this header container.

headers = re.finditer(r'<div className="bg-white border-b border-\[#e3e7ef\] flex h-\[var\(--header-height\)\].*?</div>\s*</div>', content, re.DOTALL)

toggle_btn = """
          <button onClick={() => setDarkMode(!darkMode)} className="ml-2 w-8 h-8 rounded-full bg-[#f4f6fa] flex items-center justify-center text-[#182033] hover:bg-[#e3e7ef] transition-colors shrink-0">
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
"""

new_content = ""
last_end = 0
for match in headers:
    new_content += content[last_end:match.end() - 6] + toggle_btn + "\n        </div>"
    last_end = match.end()

new_content += content[last_end:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Injected Dark Mode toggle buttons into headers")